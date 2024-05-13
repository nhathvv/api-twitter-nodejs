import { TweetRequestBody } from '~/models/requests/Tweets.request'
import databaseService from './database.services'
import Tweet from '~/models/schemas/Tweets.schema'
import { ObjectId } from 'mongodb'

class TweetsService {
  async createTweet(user_id: string, body: TweetRequestBody) {
    const result = databaseService.tweets.insertOne(
      new Tweet({
        user_id: new ObjectId(user_id),
        audience: body.audience,
        type: body.type,
        content: body.content,
        parent_id: body.parent_id,
        hashtags: [],
        mentions: body.mentions,
        medias: body.medias
      })
    )
    return result
  }
}
const tweetService = new TweetsService()
export default tweetService
