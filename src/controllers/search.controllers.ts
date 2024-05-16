import { Request, Response } from 'express'
import searchService from '~/services/search.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { SearchReqQuery } from '~/models/requests/Searchs.request'
import { SEARCH_MESSAGES } from '~/constants/messages'

export const searchController = async (req: Request<ParamsDictionary, any, any, SearchReqQuery>, res: Response) => {
  const { content } = req.query
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const user_id = req.decoded_authorization?.user_id as string
  const { tweets, total } = await searchService.search({
    content,
    limit,
    page,
    user_id
  })
  return res.status(200).json({
    message: SEARCH_MESSAGES.SEARCH_SUCCESS,
    result: {
      tweets,
      limit,
      page,
      total_page: Math.ceil(total / limit)
    }
  })
}
