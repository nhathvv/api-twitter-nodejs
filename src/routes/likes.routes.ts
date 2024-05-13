import { Router } from 'express'
import { likeTweetController, unlikeTweetController } from '~/controllers/like.controllers'
import { audienceValidator, tweetIdValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const likesRoutes = Router()
/**
 * Description. Like tweet
 * Path: /
 * Method: POST
 * Body : {tweet_id : string}
 * Headers : {Authorization : Bearer <access_token>
 */
likesRoutes.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(likeTweetController)
)
/**
 * Description. Unlike tweet
 * Path: /tweets/:tweet_id
 * Method: DELETE
 * Parameters : {tweet_id : string}
 * Headers : {Authorization : Bearer <access_token>
 */
likesRoutes.delete(
  '/tweets/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(unlikeTweetController)
)
export default likesRoutes
