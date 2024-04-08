import databaseService from './database.services'
import User from '../models/schemas/Users.schema'
import { RegisterReqBody, updateMeReqBody } from '~/models/requests/Users.request'
import { hashPassword } from '~/utils/crypto'
import { signToken, verifyToken } from '~/utils/jwt'
import { TokenTypes, UserVerifyStatus } from '~/constants/enums'
import { ObjectId } from 'mongodb'
import { RefreshTokens } from '~/models/schemas/RefreshTokens.schema'
import { config } from 'dotenv'
import { ErrorWithStatus } from '~/models/Errors'
import USERS_MESSAGES from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'
config()
class UsersService {
  private signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenTypes.AccessToken, verify },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: process.env.EXPIRES_IN_ACCESS_TOKEN
      }
    })
  }
  private signRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenTypes.RefreshToken, verify },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: process.env.EXPIRES_IN_REFRESH_TOKEN
      }
    })
  }
  async signEmailVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenTypes.VerifyEmailToken, verify },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: {
        expiresIn: process.env.EXPIRES_IN_EMAIL_VERIFY_TOKEN
      }
    })
  }
  async signForgotPasswordToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenTypes.ForgotPasswordToken },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options: {
        expiresIn: process.env.EXPIRES_IN_FORGOT_PASSWORD_TOKEN
      }
    })
  }
  private signAccessTokenAndRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
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
    const user = new User({
      ...payload,
      _id: user_id,
      email_verify_token,
      date_of_birth: new Date(payload.date_of_birth),
      password: hashPassword(payload.password)
    })
    await databaseService.users.insertOne(user)
    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    await databaseService.refreshTokens.insertOne(
      new RefreshTokens({
        user_id: new ObjectId(user_id),
        token: refresh_token
      })
    )
    return {
      access_token,
      refresh_token
    }
  }
  async login({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken({ user_id, verify })
    await databaseService.refreshTokens.insertOne(
      new RefreshTokens({
        user_id: new ObjectId(user_id),
        token: refresh_token
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
    verify
  }: {
    user_id: string
    refresh_token: string
    verify: UserVerifyStatus
  }) {
    const [new_access_token, new_refresh_token] = await this.signAccessTokenAndRefreshToken({ user_id, verify })
    await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    await databaseService.refreshTokens.insertOne(
      new RefreshTokens({
        user_id: new ObjectId(user_id),
        token: new_refresh_token
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
  async resendVerifyEmail(user_id: string) {
    const email_verify_token = (await this.signEmailVerifyToken({
      user_id,
      verify: UserVerifyStatus.Unverified
    })) as string
    console.log('Resend verify email token: ', email_verify_token)
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      { $set: { email_verify_token }, $currentDate: { updated_at: true } }
    )
    return {
      message: USERS_MESSAGES.RESEND_VERIFY_EMAIL_SUCCESS
    }
  }
  async forgotPassword({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const forgot_password_token = (await this.signForgotPasswordToken({ user_id, verify })) as string
    console.log('Forgot password token: ', forgot_password_token)
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
}
const usersService = new UsersService()
export default usersService
