import { Router } from 'express'
import { getConversationsController } from '~/controllers/conversation.controllers'
import { paginationValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, getConversationsValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'

const conversationsRoutes = Router()
/**
 * Description. Get conversation by receiverID
 * Path: /receiver/:receiver_id
 * Method: GET
 * Query : {limit: number, page: number}
 * Params: {receiver_id: string}
 * Headers : {Authorization : Bearer <access_token>
 */
conversationsRoutes.get(
  '/receivers/:receiver_id',
  accessTokenValidator,
  verifiedUserValidator,
  paginationValidator,
  getConversationsValidator,
  getConversationsController
)
export default conversationsRoutes
