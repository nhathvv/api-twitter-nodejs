import { Db, MongoClient, Collection } from 'mongodb'
import { config } from 'dotenv'
import User from '~/models/schemas/Users.schema'
import { RefreshTokens } from '~/models/schemas/RefreshTokens.schema'
import { Followers } from '~/models/schemas/Followers.schema'
import { VideoStatus } from '~/models/schemas/VideoStatus.schema'
import Tweet from '~/models/schemas/Tweets.schema'
import Hashtag from '~/models/schemas/Hashtags.schema'
import { Bookmark } from '~/models/schemas/Bookmarks.schema'
import { Like } from '~/models/schemas/Likes.schema'
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
  async indexUsers() {
    const exits = await this.users.indexExists(['email_1', 'username_1', 'email_1_password_1'])
    if (!exits) {
      this.users.createIndex({ email: 1, password: 1 })
      this.users.createIndex({ email: 1 }, { unique: true })
      this.users.createIndex({ username: 1 }, { unique: true })
    }
  }
  async indexRefreshTokens() {
    const exits = await this.refreshTokens.indexExists(['token_1', 'exp_1'])
    if (!exits) {
      this.refreshTokens.createIndex({ token: 1 }, { unique: true })
      this.refreshTokens.createIndex({ exp: 1 }, { expireAfterSeconds: 0 })
    }
  }
  async indexFollowers() {
    const exits = await this.followers.indexExists(['user_id_1_followed_user_id_1'])
    if (!exits) {
      this.followers.createIndex({ user_id: 1, followed_user_id: 1 })
    }
  }
  async indexVideoStatus() {
    const exits = await this.videoStatus.indexExists(['name_1'])
    if (!exits) {
      this.videoStatus.createIndex({ name: 1 }, { unique: true })
    }
  }
  async indexTweets() {
    const exits = await this.tweets.indexExists(['content_text'])
    if (!exits) {
      this.tweets.createIndex({ content: 'text' }, { default_language: 'none' })
    }
  }
  get users(): Collection<User> {
    return this.db.collection(process.env.DB_COLLECTION_USER as string)
  }
  get refreshTokens(): Collection<RefreshTokens> {
    return this.db.collection(process.env.DB_COLLECTION_REFRESH_TOKEN as string)
  }
  get followers(): Collection<Followers> {
    return this.db.collection(process.env.DB_COLLECTION_FOLLOWER as string)
  }
  get videoStatus(): Collection<VideoStatus> {
    return this.db.collection(process.env.DB_COLLECTION_VIDEO_STATUS as string)
  }
  get tweets(): Collection<Tweet> {
    return this.db.collection(process.env.DB_COLLECTION_TWEET as string)
  }
  get hashtags(): Collection<Hashtag> {
    return this.db.collection(process.env.DB_COLLECTION_HASHTAG as string)
  }
  get bookmarks(): Collection<Bookmark> {
    return this.db.collection(process.env.DB_COLLECTION_BOOKMARK as string)
  }
  get likes(): Collection<Like> {
    return this.db.collection(process.env.DB_COLLECTION_LIKE as string)
  }
}

const databaseService = new DatabaseService()
export default databaseService
