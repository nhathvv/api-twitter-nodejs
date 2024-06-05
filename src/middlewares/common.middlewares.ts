import { Request, Response, NextFunction } from 'express'
import { JsonWebTokenError } from 'jsonwebtoken'
import { pick } from 'lodash'
import { envConfig } from '~/constants/config'
import HTTP_STATUS from '~/constants/httpStatus'
import USERS_MESSAGES from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { verifyToken } from '~/utils/jwt'
type FilterKeys<T> = Array<keyof T>
export const filterMiddleware =
  <T>(filterKeys: FilterKeys<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    req.body = pick(req.body, filterKeys)
    next()
  }
export const verifyAccessToken = async (access_token: string, req?: Request) => {
  if (!access_token) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }
  try {
    const decoded_authorization = await verifyToken({
      token: access_token,
      secretOrPublicKey: envConfig.jwtSecretAccessToken as string
    })
    if (req) {
      req.decoded_authorization = decoded_authorization
      return true
    }
    return decoded_authorization
  } catch (error) {
    throw new ErrorWithStatus({
      message: (error as JsonWebTokenError).message,
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }
}
