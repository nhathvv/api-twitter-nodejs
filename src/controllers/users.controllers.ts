import { Request, Response } from 'express'
import { RegisterReqBody } from '~/models/requests/Users.request'
import User from '~/models/schemas/Users.schema'
import usersService from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body
  if (email === 'nhathv.73qb@gmail.com' && password === '123456') {
    return res.status(200).json({ message: 'Login success' })
  }
  return res.status(400).json({ message: 'Login failed' })
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const result = await usersService.register(req.body)
  return res.status(201).json({
    message: 'Register success',
    result
  })
}
