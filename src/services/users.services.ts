import databaseService from './database.services'
import User from '../models/schemas/Users.schema'
class UsersService {
  async register(payload: { email: string; password: string }) {
    const { email, password } = payload
    const user = new User({ email, password })
    const result = await databaseService.users.insertOne(user)
    return result
  }
  async checkEmailExist(email: string) {
    const result = await databaseService.users.findOne({ email })
    return Boolean(result)
  }
}
const usersService = new UsersService()
export default usersService
