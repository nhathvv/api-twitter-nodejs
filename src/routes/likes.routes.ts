import { Router } from 'express'
import { likeTweetController, unlikeTweetController } from '~/controllers/like.controllers'
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
likesRoutes.post('/', accessTokenValidator, verifiedUserValidator, wrapRequestHandler(likeTweetController))
likesRoutes.delete(
  '/tweets/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(unlikeTweetController)
)
export default likesRoutes
