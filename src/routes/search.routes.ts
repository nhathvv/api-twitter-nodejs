import { Router } from 'express'
import { searchController } from '~/controllers/search.controllers'
import { searchValidator } from '~/middlewares/search.middlewares'
import { paginationValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'

const searchRoutes = Router()
/**
 * Description. Search
 * Path: /search
 * Method: GET
 * Query : {query : string, limit: string, page: string}
 * Headers : {Authorization : Bearer <access_token>}
 */
searchRoutes.get(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  searchValidator,
  paginationValidator,
  searchController
)
export default searchRoutes
