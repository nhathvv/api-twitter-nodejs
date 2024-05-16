import { Router } from 'express'
import { searchController } from '~/controllers/search.controllers'

const searchRoutes = Router()
/**
 * Description. Search
 * Path: /search
 * Method: GET
 * Query : {query : string, limit: string, page: string}
 * Headers : {Authorization : Bearer <access_token>}
 */
searchRoutes.get('/', searchController)
export default searchRoutes
