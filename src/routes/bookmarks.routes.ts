import { Router } from 'express'
import {
  bookmarkTweetController,
  unbookmarkTweetController,
  unbookmarkTweetbyIdController
} from '~/controllers/bookmark.controllers'
import { tweetIdValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const bookmarksRoutes = Router()
/**
 * Description. Bookmark tweet
 * Path: /
 * Method: POST
 * Body : {tweet_id : string}
 * Headers : {Authorization : Bearer <access_token>
 */
bookmarksRoutes.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(bookmarkTweetController)
)
/**
 * Description. Unbookmark tweet
 * Path: /tweets/:tweet_id
 * Method: DELETE
 * Parameters : {tweet_id : string}
 * Headers : {Authorization : Bearer <access_token>
 */
bookmarksRoutes.delete(
  '/tweets/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(unbookmarkTweetController)
)
bookmarksRoutes.delete(
  '/:bookmark_id',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(unbookmarkTweetbyIdController)
)
export default bookmarksRoutes
