import { Pagination } from './Tweets.request'

export interface SearchReqQuery extends Pagination {
  content: string
}
