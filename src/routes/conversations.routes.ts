import { Router } from 'express'
import { getConversationsController } from '~/controllers/conversation.controllers'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'

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
  '/receiver/:receiver_id',
  accessTokenValidator,
  verifiedUserValidator,
  getConversationsController
)
export default conversationsRoutes
