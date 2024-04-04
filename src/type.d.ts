import { TokenPayload } from './models/requests/Users.request'
import User from './models/schemas/Users.schema'
import { Request } from 'express'

declare module 'express' {
  interface Request {
    user?: User
    decoded_authorization?: TokenPayload
    decoded_refresh_token?: TokenPayload
    decoded_email_verify_token?: TokenPayload
  }
}
