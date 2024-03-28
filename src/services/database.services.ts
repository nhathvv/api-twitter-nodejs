import { MongoClient } from 'mongodb'
import { config } from 'dotenv'
config()
console.log(process.env.DB_USERNAME)
console.log(process.env.DB_PASSWORD)

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@twitter.rpneoyv.mongodb.net/?retryWrites=true&w=majority&appName=Twitter`
class DatabaseService {
  private client: MongoClient

  constructor() {
    this.client = new MongoClient(uri)
  }
  async connect() {
    try {
      await this.client.db('admin').command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.error('Error connecting to MongoDB:', error)
    } finally {
      await this.client.close()
    }
  }
}

const databaseService = new DatabaseService()
export default databaseService
