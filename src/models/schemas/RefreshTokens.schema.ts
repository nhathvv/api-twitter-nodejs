import { ObjectId } from 'mongodb'

interface RefreshTokenType {
  _id?: ObjectId
  user_id: ObjectId
  token: string
  created_at?: Date
  iat: number
  exp: number
}
export class RefreshTokens {
  _id?: ObjectId
  user_id: ObjectId
  token: string
  created_at: Date
  iat: Date
  exp: Date
  constructor({ _id, token, created_at, user_id, iat, exp }: RefreshTokenType) {
    const date = new Date()
    this._id = _id
    this.user_id = user_id
    this.token = token
    this.created_at = created_at || date
    this.iat = new Date(iat * 1000)
    this.exp = new Date(exp * 1000)
  }
}
