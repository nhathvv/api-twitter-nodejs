import User from './models/schemas/Users.schema'
import { Request } from 'express'

declare module 'express' {
  interface Request {
    user?: User
  }
}
