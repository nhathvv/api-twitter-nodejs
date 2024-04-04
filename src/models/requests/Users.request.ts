import { JwtPayload } from 'jsonwebtoken'
import { TokenTypes, UserVerifyStatus } from '~/constants/enums'

export interface RegisterReqBody {
  name: string
  email: string
  password: string
  date_of_birth: Date
}
export interface LogoutReqBody {
  refresh_token: string
}
export interface RefreshTokenReqBody {
  refresh_token: string
}
export interface VerifyEmailReqBody {
  email_verify_token: string
}
export interface resetPasswordReqBody {
  forgot_password_token: string
  password: string
  confirm_password: string
}
export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenTypes
  verify: UserVerifyStatus
  exp: number
  iat: number
}
