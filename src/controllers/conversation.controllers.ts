import { Request, Response } from 'express'
import { CONVERSATION_MESSAGE } from '~/constants/messages'
import conversationService from '~/services/conversation.services'
export const getConversationsController = async (req: Request, res: Response) => {
  const sender_id = req.decoded_authorization?.user_id as string
  const { receiver_id } = req.params
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const result = await conversationService.getConversations({
    sender_id,
    receiver_id,
    limit,
    page
  })
  return res.json({
    result: {
      limit,
      page,
      total: Math.ceil(result.total / limit),
      conversations: result.conversations
    },
    message: CONVERSATION_MESSAGE.GET_CONVERSATION_SUCCESSFULLY
  })
}
