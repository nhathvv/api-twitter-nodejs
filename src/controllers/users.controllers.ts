import { Request, Response } from 'express'
import { RegisterReqBody } from '~/models/requests/Users.request'
import usersService from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import USERS_MESSAGES from '~/constants/messages'
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
