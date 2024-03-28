import { Request, Response } from 'express'
import User from '~/models/schemas/Users.schema'
import usersService from '~/services/users.services'
export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body
  if (email === 'nhathv.73qb@gmail.com' && password === '123456') {
    return res.status(200).json({ message: 'Login success' })
  }
  return res.status(400).json({ message: 'Login failed' })
}
export const registerController = async (req: Request, res: Response) => {
  const { email, password } = req.body
  try {
    const result = await usersService.register({ email, password })
    return res.status(201).json({
      message: 'Register success',
      result
    })
  } catch (error) {
    return res.status(400).json({
      message: 'Register failed',
      error
    })
  }
}
