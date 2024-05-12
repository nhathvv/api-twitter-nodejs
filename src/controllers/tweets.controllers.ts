import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { config } from 'dotenv'
import { TweetRequestBody } from '~/models/requests/Tweets.request'
config()
export const createTweetController = async (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response) => {
  return res.send('createTweetController')
}
