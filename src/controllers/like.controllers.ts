import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { LikeRequestBody } from '~/models/requests/Likes.request'
import { TokenPayload } from '~/models/requests/Users.request'
import { LIKE_MESSAGES } from '~/constants/messages'
import likeService from '~/services/like.services'
export const likeTweetController = async (req: Request<ParamsDictionary, any, LikeRequestBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { tweet_id } = req.body
  const result = await likeService.likeTweet(user_id, tweet_id)
  return res.status(200).json({
    message: LIKE_MESSAGES.LIKE_SUCCESSFULLY,
    result
  })
}
export const unlikeTweetController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { tweet_id } = req.params
  const result = await likeService.unlikeTweet(user_id, tweet_id)
  return res.status(200).json({
    message: LIKE_MESSAGES.UNLIKE_SUCCESSFULLY,
    result
  })
}
