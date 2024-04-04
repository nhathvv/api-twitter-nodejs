import { Request, Response } from 'express'
import {
  LogoutReqBody,
  RefreshTokenReqBody,
  RegisterReqBody,
  TokenPayload,
  VerifyEmailReqBody,
  resetPasswordReqBody
} from '~/models/requests/Users.request'
import usersService from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import USERS_MESSAGES from '~/constants/messages'
import databaseService from '~/services/database.services'
import HTTP_STATUS from '~/constants/httpStatus'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enums'
import User from '~/models/schemas/Users.schema'
export const loginController = async (req: Request, res: Response) => {
  const { user }: any = req
  const user_id = user._id.toString()
  const result = await usersService.login(user_id)
  return res.status(200).json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result
  })
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const result = await usersService.register(req.body)
  return res.status(201).json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    result
  })
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const refresh_token = req.body.refresh_token
  const result = await usersService.logout(refresh_token)
  return res.status(200).json(result)
}

export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenReqBody>,
  res: Response
) => {
  const refresh_token = req.body.refresh_token
  const { user_id } = req.decoded_refresh_token as TokenPayload
  const result = await usersService.refreshToken({ user_id, refresh_token })
  return res.status(200).json({
    message: USERS_MESSAGES.REFRESH_TOKEN_SUCCESS,
    result
  })
}

export const verifyEmailController = async (req: Request<ParamsDictionary, any, VerifyEmailReqBody>, res: Response) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  const user = await databaseService.users.findOne({
    _id: new ObjectId(user_id)
  })
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  }
  if (user.email_verify_token == '') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }
  const result = await usersService.verifyEmail(user_id)
  return res.status(HTTP_STATUS.ACCEPTED).json({
    message: USERS_MESSAGES.EMAIL_VERIFY_SUCCESS,
    result
  })
}

export const resendVerifyEmailController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await databaseService.users.findOne({
    _id: new ObjectId(user_id)
  })
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  }
  if (user.verify === UserVerifyStatus.Verified) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }
  const result = await usersService.resendVerifyEmail(user_id)
  return res.status(HTTP_STATUS.ACCEPTED).json(result)
}

export const forgotPasswordController = async (req: Request, res: Response) => {
  const { _id } = req.user as User
  const result = await usersService.forgotPassword((_id as ObjectId).toString())
  return res.status(HTTP_STATUS.ACCEPTED).json(result)
}
export const verifyForgotPasswordTokenController = async (req: Request, res: Response) => {
  return res.status(HTTP_STATUS.ACCEPTED).json({
    message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS
  })
}
export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, resetPasswordReqBody>,
  res: Response
) => {
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  const { password } = req.body
  const result = await usersService.resetPassword(user_id, password)
  return res.status(HTTP_STATUS.ACCEPTED).json(result)
}
