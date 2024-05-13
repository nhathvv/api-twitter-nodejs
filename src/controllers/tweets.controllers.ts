import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { config } from 'dotenv'
import { TweetRequestBody } from '~/models/requests/Tweets.request'
import tweetService from '~/services/tweets.services'
import { TokenPayload } from '~/models/requests/Users.request'
import { TWEET_MESSAGES } from '~/constants/messages'
config()
export const createTweetController = async (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { body } = req
  const result = await tweetService.createTweet(user_id, body)
  return res.status(201).json({
    message: TWEET_MESSAGES.CREATE_TWEET_SUCCESS,
    result
  })
}
