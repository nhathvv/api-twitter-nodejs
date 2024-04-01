import databaseService from './database.services'
import User from '../models/schemas/Users.schema'
import { RegisterReqBody } from '~/models/requests/Users.request'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenTypes } from '~/constants/enums'
class UsersService {
  private signAccessToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenTypes.AccessToken },
      options: {
        expiresIn: process.env.EXPIRES_IN_ACCESS_TOKEN
      }
    })
  }
  private signRefreshToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenTypes.RefreshToken },
      options: {
        expiresIn: process.env.EXPIRES_IN_REFRESH_TOKEN
      }
    })
  }
  async register(payload: RegisterReqBody) {
    const user = new User({
      ...payload,
      date_of_birth: new Date(payload.date_of_birth),
      password: hashPassword(payload.password)
    })
    const result = await databaseService.users.insertOne(user)
    const user_id = result.insertedId.toString()
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken(user_id) as Promise<string>,
      this.signRefreshToken(user_id) as Promise<string>
    ])
    return {
      access_token,
      refresh_token
    }
  }
  async checkEmailExist(email: string) {
    const result = await databaseService.users.findOne({ email })
    return Boolean(result)
  }
}
const usersService = new UsersService()
export default usersService
