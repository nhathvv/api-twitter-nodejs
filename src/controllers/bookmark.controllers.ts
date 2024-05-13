import { Request, Response } from 'express'
import { config } from 'dotenv'
import { TokenPayload } from '~/models/requests/Users.request'
import HTTP_STATUS from '~/constants/httpStatus'
import bookmarkService from '~/services/bookmark.services'
import { BOOKMARK_MESSAGES } from '~/constants/messages'
import { ParamsDictionary } from 'express-serve-static-core'
import { BookmarkRequestBody } from '~/models/requests/Bookmarks.request'
config()
export const bookmarkTweetsController = async (
  req: Request<ParamsDictionary, any, BookmarkRequestBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { tweet_id } = req.body
  const result = await bookmarkService.bookmarkTweet(user_id, tweet_id)
  return res.status(HTTP_STATUS.OK).json({
    message: BOOKMARK_MESSAGES.BOOKMARK_SUCCESSFULLY,
    result
  })
}
