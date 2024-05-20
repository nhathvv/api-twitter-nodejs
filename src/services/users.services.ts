import databaseService from './database.services'
import User from '../models/schemas/Users.schema'
import { RegisterReqBody, updateMeReqBody } from '~/models/requests/Users.request'
import { hashPassword } from '~/utils/crypto'
import { signToken, verifyToken } from '~/utils/jwt'
import { TokenTypes, UserVerifyStatus } from '~/constants/enums'
import { ObjectId } from 'mongodb'
import { RefreshTokens } from '~/models/schemas/RefreshTokens.schema'
import { ErrorWithStatus } from '~/models/Errors'
import USERS_MESSAGES from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'
import { Followers } from '~/models/schemas/Followers.schema'
import axios from 'axios'
import { sendVerifyForgotPasswordEmail, sendVerifyRegisterEmail } from '~/utils/email'
import { envConfig } from '~/constants/config'
class UsersService {
  private signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenTypes.AccessToken, verify },
      privateKey: envConfig.jwtSecretAccessToken as string,
      options: {
        expiresIn: envConfig.expiresInAccessToken
      }
    })
  }
  private signRefreshToken({ user_id, verify, exp }: { user_id: string; verify: UserVerifyStatus; exp?: number }) {
    if (exp) {
      return signToken({
        payload: { user_id, token_type: TokenTypes.RefreshToken, verify, exp },
        privateKey: envConfig.jwtSecretRefreshToken as string
      })
    }
    return signToken({
      payload: { user_id, token_type: TokenTypes.RefreshToken, verify },
      privateKey: envConfig.jwtSecretRefreshToken as string,
      options: {
        expiresIn: envConfig.expiresInRefreshToken
      }
    })
  }
  async signEmailVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenTypes.VerifyEmailToken, verify },
      privateKey: envConfig.jwtSecretEmailVerifyToken as string,
      options: {
        expiresIn: envConfig.expiresInEmailVerifyToken
      }
    })
  }
  private decodeRefreshToken(refresh_token: string) {
    return verifyToken({ token: refresh_token, secretOrPublicKey: envConfig.jwtSecretRefreshToken as string })
  }
  async signForgotPasswordToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenTypes.ForgotPasswordToken },
      privateKey: envConfig.jwtForgotPasswordToken as string,
      options: {
        expiresIn: envConfig.expiresInForgotPasswordToken
      }
    })
  }
  private async signAccessTokenAndRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return Promise.all([
      this.signAccessToken({ user_id, verify }),
      this.signRefreshToken({ user_id, verify })
    ]) as Promise<[string, string]>
  }
  async register(payload: RegisterReqBody) {
    const user_id = new ObjectId()
    const email_verify_token = (await this.signEmailVerifyToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })) as string
    console.log('email_verify_token', email_verify_token)
    console.log(payload.email)
    const user = new User({
      ...payload,
      _id: user_id,
      username: `user${user_id.toString()}`,
      email_verify_token,
      date_of_birth: new Date(payload.date_of_birth),
      password: hashPassword(payload.password)
    })
    await databaseService.users.insertOne(user)
    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    const { iat, exp } = await this.decodeRefreshToken(refresh_token)
    await databaseService.refreshTokens.insertOne(
      new RefreshTokens({
        user_id: new ObjectId(user_id),
        token: refresh_token,
        iat,
        exp
      })
    )
    await sendVerifyRegisterEmail(payload.email, email_verify_token)
    return {
      access_token,
      refresh_token
    }
  }
  private async getGoogleUserInfo(access_token: string, id_token: string) {
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      headers: {
        Authorization: `Bearer ${id_token}`
      },
      params: {
        access_token,
        alt: 'json'
      }
    })
    return data as {
      id: string
      email: string
      name: string
      given_name: string
      family_name: string
      picture: string
      email_verified: boolean
    }
  }
  private async getGoogleOAuthToken(code: string) {
    const body = {
      code,
      client_id: envConfig.googleClientId as string,
      client_secret: envConfig.googleClientSecret as string,
      redirect_uri: envConfig.googleRedirectUri as string,
      grant_type: 'authorization_code'
    }
    const { data } = await axios.post('https://oauth2.googleapis.com/token', body)
    return data as {
      access_token: string
      id_token: string
    }
  }
  async oauth(code: string) {
    const { access_token, id_token } = await this.getGoogleOAuthToken(code)
    const userInfo = await this.getGoogleUserInfo(access_token, id_token)
    if (userInfo.email_verified === false) {
      throw new ErrorWithStatus({ message: USERS_MESSAGES.GMAIL_NOT_VERIFIED, status: HTTP_STATUS.BAD_REQUEST })
    }
    const user = await databaseService.users.findOne({ email: userInfo.email })
    if (user) {
      const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken({
        user_id: user._id.toString(),
        verify: user.verify
      })
      const { iat, exp } = await this.decodeRefreshToken(refresh_token)
      await databaseService.refreshTokens.insertOne(
        new RefreshTokens({
          user_id: new ObjectId(user._id),
          token: refresh_token,
          iat,
          exp
        })
      )
      return {
        access_token,
        refresh_token,
        newUser: 0,
        verify: user.verify
      }
    }
    const password = Math.random().toString(36).slice(-8)
    const data = await this.register({
      name: userInfo.name,
      email: userInfo.email,
      password,
      confirm_password: password,
      date_of_birth: new Date().toISOString()
    })
    return { ...data, newUser: 1, verify: UserVerifyStatus.Unverified }
  }
  async login({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken({ user_id, verify })
    const { iat, exp } = await this.decodeRefreshToken(refresh_token)
    await databaseService.refreshTokens.insertOne(
      new RefreshTokens({
        user_id: new ObjectId(user_id),
        token: refresh_token,
        iat,
        exp
      })
    )
    return {
      access_token,
      refresh_token
    }
  }
  async checkEmailExist(email: string) {
    const result = await databaseService.users.findOne({ email })
    return Boolean(result)
  }
  async logout(refresh_token: string) {
    await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    return {
      message: 'Logout success'
    }
  }
  async refreshToken({
    user_id,
    refresh_token,
    verify,
    exp
  }: {
    user_id: string
    refresh_token: string
    verify: UserVerifyStatus
    exp: number
  }) {
    const [new_access_token, new_refresh_token] = await Promise.all([
      this.signAccessToken({ user_id, verify }),
      this.signRefreshToken({ user_id, verify, exp }),
      databaseService.refreshTokens.deleteOne({ token: refresh_token })
    ])
    const decoded_refresh_token = await this.decodeRefreshToken(refresh_token)
    await databaseService.refreshTokens.insertOne(
      new RefreshTokens({
        user_id: new ObjectId(user_id),
        token: new_refresh_token as string,
        iat: decoded_refresh_token.iat,
        exp: decoded_refresh_token.exp
      })
    )
    return {
      access_token: new_access_token,
      refresh_token: new_refresh_token
    }
  }
  async verifyEmail(user_id: string) {
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      { $set: { email_verify_token: '', verify: UserVerifyStatus.Verified }, $currentDate: { updated_at: true } }
    )
    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken({
      user_id,
      verify: UserVerifyStatus.Verified
    })
    return {
      access_token,
      refresh_token
    }
  }
  async resendVerifyEmail(user_id: string, email: string) {
    const email_verify_token = (await this.signEmailVerifyToken({
      user_id,
      verify: UserVerifyStatus.Unverified
    })) as string
    console.log('Resend verify email token: ', email_verify_token)
    await sendVerifyRegisterEmail(email, email_verify_token)
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      { $set: { email_verify_token }, $currentDate: { updated_at: true } }
    )
    return {
      message: USERS_MESSAGES.RESEND_VERIFY_EMAIL_SUCCESS
    }
  }
  async forgotPassword({ user_id, verify, email }: { user_id: string; verify: UserVerifyStatus; email: string }) {
    const forgot_password_token = (await this.signForgotPasswordToken({ user_id, verify })) as string
    await sendVerifyForgotPasswordEmail(email, forgot_password_token)
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      { $set: { forgot_password_token }, $currentDate: { updated_at: true } }
    )
    return {
      message: USERS_MESSAGES.CHECK_EMAIL_TO_REST_PASSWORD
    }
  }
  async resetPassword(user_id: string, password: string) {
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      { $set: { password: hashPassword(password), forgot_password_token: '' }, $currentDate: { updated_at: true } }
    )
    return {
      message: USERS_MESSAGES.RESET_PASSWORD_SUCCESS
    }
  }
  async getMe(user_id: string) {
    const user = await databaseService.users.findOne(
      { _id: new ObjectId(user_id) },
      { projection: { password: 0, forgot_password_token: 0, email_verify_token: 0 } }
    )
    if (!user) {
      throw new ErrorWithStatus({ message: USERS_MESSAGES.USER_NOT_FOUND, status: HTTP_STATUS.NOT_FOUND })
    }
    return user
  }
  async getProfile(username: string) {
    const user = await databaseService.users.findOne(
      { username: username },
      { projection: { password: 0, forgot_password_token: 0, email_verify_token: 0, verify: 0 } }
    )
    if (!user) {
      throw new ErrorWithStatus({ message: USERS_MESSAGES.USER_NOT_FOUND, status: HTTP_STATUS.NOT_FOUND })
    }
    return user
  }
  async updateMe(user_id: string, payload: updateMeReqBody) {
    const _payload = payload.date_of_birth ? { ...payload, date_of_birth: new Date(payload.date_of_birth) } : payload
    const user = await databaseService.users.findOneAndUpdate(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          ...(_payload as updateMeReqBody & { date_of_birth: Date })
        },
        $currentDate: { updated_at: true }
      },
      {
        returnDocument: 'after',
        projection: { password: 0, forgot_password_token: 0, email_verify_token: 0 }
      }
    )
    return user
  }
  async follow(user_id: string, followed_user_id: string) {
    const follower = await databaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })
    if (follower === null) {
      await databaseService.followers.insertOne(
        new Followers({ user_id: new ObjectId(user_id), followed_user_id: new ObjectId(followed_user_id) })
      )
      return {
        message: USERS_MESSAGES.FOLLOW_SUCCESS
      }
    }
    return {
      message: USERS_MESSAGES.FOLLOWED
    }
  }
  async unfollow(user_id: string, followed_user_id: string) {
    const follower = await databaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })
    if (follower === null) {
      return {
        message: USERS_MESSAGES.ALREADY_UNFOLLOWED
      }
    }
    await databaseService.followers.deleteOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })
    return {
      message: USERS_MESSAGES.UNFOLLOW_SUCCESS
    }
  }
  async changePassword(user_id: string, password: string) {
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      { $set: { password: hashPassword(password) }, $currentDate: { updated_at: true } }
    )
    return {
      message: 'Change password success'
    }
  }
}
const usersService = new UsersService()
export default usersService
