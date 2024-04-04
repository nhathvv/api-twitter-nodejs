import databaseService from './database.services'
import User from '../models/schemas/Users.schema'
import { RegisterReqBody } from '~/models/requests/Users.request'
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
  private signAccessToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenTypes.AccessToken },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: process.env.EXPIRES_IN_ACCESS_TOKEN
      }
    })
  }
  private signRefreshToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenTypes.RefreshToken },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: process.env.EXPIRES_IN_REFRESH_TOKEN
      }
    })
  }
  async signEmailVerifyToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenTypes.VerifyEmailToken },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: {
        expiresIn: process.env.EXPIRES_IN_EMAIL_VERIFY_TOKEN
      }
    })
  }
  async signForgotPasswordToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenTypes.ForgotPasswordToken },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options: {
        expiresIn: process.env.EXPIRES_IN_FORGOT_PASSWORD_TOKEN
      }
    })
  }
  private signAccessTokenAndRefreshToken(user_id: string) {
    return Promise.all([this.signAccessToken(user_id), this.signRefreshToken(user_id)]) as Promise<[string, string]>
  }
  async register(payload: RegisterReqBody) {
    const user_id = new ObjectId()
    const email_verify_token = (await this.signEmailVerifyToken(user_id.toString())) as string
    console.log('email_verify_token', email_verify_token)
    const user = new User({
      ...payload,
      _id: user_id,
      email_verify_token,
      date_of_birth: new Date(payload.date_of_birth),
      password: hashPassword(payload.password)
    })
    await databaseService.users.insertOne(user)
    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken(user_id.toString())
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
  async login(user_id: string) {
    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken(user_id)
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
  async refreshToken({ user_id, refresh_token }: { user_id: string; refresh_token: string }) {
    const [new_access_token, new_refresh_token] = await this.signAccessTokenAndRefreshToken(user_id)
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
    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken(user_id)
    return {
      access_token,
      refresh_token
    }
  }
  async resendVerifyEmail(user_id: string) {
    const email_verify_token = (await this.signEmailVerifyToken(user_id)) as string
    console.log('Resend verify email token: ', email_verify_token)
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      { $set: { email_verify_token }, $currentDate: { updated_at: true } }
    )
    return {
      message: USERS_MESSAGES.RESEND_VERIFY_EMAIL_SUCCESS
    }
  }
  async forgotPassword(user_id: string) {
    const forgot_password_token = (await this.signForgotPasswordToken(user_id)) as string
    console.log('Forgot password token: ', forgot_password_token)
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      { $set: { forgot_password_token }, $currentDate: { updated_at: true } }
    )
    return {
      message: USERS_MESSAGES.CHECK_EMAIL_TO_REST_PASSWORD
    }
  }
}
const usersService = new UsersService()
export default usersService
