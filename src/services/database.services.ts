import { Db, MongoClient, Collection } from 'mongodb'
import { config } from 'dotenv'
import User from '~/models/schemas/Users.schema'
import { RefreshTokens } from '~/models/schemas/RefreshTokens.schema'
config()

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@twitter.rpneoyv.mongodb.net/?retryWrites=true&w=majority&appName=Twitter`
class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(process.env.DB_NAME)
  }
  async connect() {
    try {
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.error('Error connecting to MongoDB:', error)
    }
  }
  get users(): Collection<User> {
    return this.db.collection(process.env.DB_COLLECTION_USER as string)
  }
  get refreshTokens(): Collection<RefreshTokens> {
    return this.db.collection(process.env.DB_COLLECTION_REFRESH_TOKEN as string)
  }
}

const databaseService = new DatabaseService()
export default databaseService
