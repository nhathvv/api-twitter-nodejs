import { MediaTypeQuery, PeopleFollow } from '~/constants/enums'
import { Pagination } from './Tweets.request'
import { Query } from 'express-serve-static-core'
export interface SearchReqQuery extends Pagination, Query {
  content: string
  media_type?: MediaTypeQuery
  people_follow?: PeopleFollow
}
