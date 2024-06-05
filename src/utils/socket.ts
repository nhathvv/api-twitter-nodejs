import { verifyAccessToken } from '~/middlewares/common.middlewares'
import { TokenPayload } from '~/models/requests/Users.request'
import { UserVerifyStatus } from '~/constants/enums'
import { ErrorWithStatus } from '~/models/Errors'
import USERS_MESSAGES from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'
import { Server } from 'socket.io'
import { Conversation } from '~/models/schemas/Conversations.schema'
import { ObjectId } from 'mongodb'
import databaseService from '~/services/database.services'
import { Server as ServerHttp } from 'http'

const initSocket = (httpServer: ServerHttp) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*'
    }
  })
  const users: {
    [key: string]: {
      socket_id: string
    }
  } = {}
  io.use(async (socket, next) => {
    try {
      const access_token = socket.handshake.auth.Authorization?.split(' ')[1]
      const decoded_authorization = await verifyAccessToken(access_token)
      const { verify } = decoded_authorization as TokenPayload
      if (verify === UserVerifyStatus.Unverified) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.USER_EMAIL_NOT_VERIFIED,
          status: HTTP_STATUS.FORBIDDEN
        })
      }
      socket.handshake.auth.decoded_authorization = decoded_authorization as TokenPayload
      socket.handshake.auth.access_token = access_token
      next()
    } catch (error) {
      next({
        message: 'Unauthorized',
        name: 'UnauthorizedError',
        data: error
      })
    }
  })
  io.on('connection', (socket) => {
    console.log(`user ${socket.id} connection`)
    const { user_id } = socket.handshake.auth.decoded_authorization
    users[user_id] = {
      socket_id: socket.id
    }
    socket.use(async (packet, next) => {
      try {
        const { access_token } = socket.handshake.auth
        await verifyAccessToken(access_token)
        next()
      } catch (error) {
        next(new Error('Unauthorized'))
      }
    })
    socket.on('error', (err) => {
      console.log(err)
      socket.disconnect()
    })
    socket.on('send_message', async (data) => {
      const { sender_id, receiver_id, content } = data.payload
      const conversation = new Conversation({
        sender_id: new ObjectId(sender_id),
        receiver_id: new ObjectId(receiver_id),
        content: content
      })
      const result = await databaseService.conversations.insertOne(conversation)
      conversation._id = result.insertedId
      const receiver_socket_id = users[receiver_id]?.socket_id
      if (receiver_socket_id) {
        socket.to(receiver_socket_id).emit('receiver_message', {
          payload: conversation,
          from: user_id
        })
      }
    })
    socket.on('disconnect', () => {
      delete users[user_id]
      console.log(`user ${socket.id} disconnect`)
    })
  })
}
export default initSocket