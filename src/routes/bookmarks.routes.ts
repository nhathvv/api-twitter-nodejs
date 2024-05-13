import { Router } from 'express'
import { bookmarkTweetsController } from '~/controllers/bookmark.controllers'
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
bookmarksRoutes.post('/', accessTokenValidator, verifiedUserValidator, wrapRequestHandler(bookmarkTweetsController))
export default bookmarksRoutes
