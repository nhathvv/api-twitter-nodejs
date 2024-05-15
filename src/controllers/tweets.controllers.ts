import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { config } from 'dotenv'
import { TweetReqQuery, TweetRequestBody } from '~/models/requests/Tweets.request'
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
export const getTweetController = async (req: Request, res: Response) => {
  const result = await tweetService.icraseView(req.params.tweet_id, req.decoded_authorization?.user_id)
  const tweet = {
    ...req.tweet,
    user_views: result.user_views,
    guest_views: result.guest_views,
    views: result.user_views + result.guest_views
  }
  return res.status(200).json({
    message: TWEET_MESSAGES.GET_TWEET_SUCCESS,
    result: tweet
  })
}
export const getTweetChildrenController = async (
  req: Request<ParamsDictionary, any, any, TweetReqQuery>,
  res: Response
) => {
  const tweet_type = Number(req.query.tweet_type)
  const page = Number(req.query.page)
  const limit = Number(req.query.limit)
  const tweet_id = req.params.tweet_id

  const { tweets, total } = await tweetService.getTweetChildren({
    tweet_id,
    tweet_type,
    page,
    limit,
    user_id: req.decoded_authorization?.user_id
  })
  return res.status(200).json({
    message: TWEET_MESSAGES.GET_TWEET_CHILDREN_SUCCESS,
    result: {
      tweets,
      limit,
      page,
      total_page: Math.ceil(total / limit),
      tweet_type
    }
  })
}
