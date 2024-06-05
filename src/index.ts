import express from 'express'
import userRouter from './routes/users.routes'
import databaseService from './services/database.services'
import defaultErrorHandler from './middlewares/error.middlewares'
import mediasRouter from './routes/medias.routes'
import { initFolder } from './utils/file'
import { config } from 'dotenv'
import staticsRouter from './routes/statics.routes'
import cors, { CorsOptions } from 'cors'
import tweetsRouter from './routes/tweets.routes'
import bookmarksRoutes from './routes/bookmarks.routes'
import likesRoutes from './routes/likes.routes'
import searchRoutes from './routes/search.routes'
import { createServer } from 'http'
import './utils/s3'
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'
import './utils/file'
import { envConfig, isProduction } from './constants/config'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import { Server } from 'socket.io'
import { Conversation } from './models/schemas/Conversations.schema'
import { ObjectId } from 'mongodb'
import conversationsRoutes from './routes/conversations.routes'
import { verifyAccessToken } from './middlewares/common.middlewares'
import { TokenPayload } from './models/requests/Users.request'
import { UserVerifyStatus } from './constants/enums'
import { ErrorWithStatus } from './models/Errors'
import USERS_MESSAGES from './constants/messages'
import HTTP_STATUS from './constants/httpStatus'
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'API X (Twitter)',
      version: '1.0.0',
      description:
        'This project is an API I developed inspired by Twitter, featuring the reconstruction of various functionalities such as managing user information, tweets, media, bookmarks, likes, and followers'
    },
    servers: [
      {
        url: 'https://nhat-dev-twitter.onrender.com/',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        BearerAuth: []
      }
    ],
    persistAuthorization: true
  },
  apis: ['./openapi/*.yaml'] // files containing annotations as above
}
const openapiSpecification = swaggerJsdoc(options)
config()

databaseService.connect().then(() => {
  databaseService.indexUsers()
  databaseService.indexRefreshTokens()
  databaseService.indexFollowers()
  databaseService.indexVideoStatus()
  databaseService.indexTweets()
})
const app = express()
const port = envConfig.port
app.use(express.json())
app.use(helmet())
const corsOptions: CorsOptions = {
  origin: isProduction ? envConfig.clientUrl : '*'
}
app.use(cors(corsOptions))
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false
})

app.use(limiter)
initFolder()

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification))
app.use('/users', userRouter)
app.use('/medias', mediasRouter)
app.use('/statics/', staticsRouter)
app.use('/tweets', tweetsRouter)
app.use('/conversations', conversationsRoutes)
app.use('/bookmarks', bookmarksRoutes)
app.use('/likes/', likesRoutes)
app.use('/search', searchRoutes)
app.use('/static', staticsRouter)

app.use(defaultErrorHandler)
const httpServer = createServer(app)
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
    next()
  } catch (error) {
    console.log(error)
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
  socket.on('send_message', async (data) => {
    const { sender_id, receiver_id, content } = data.payload
    const conversation = new Conversation({
      sender_id: new ObjectId(sender_id),
      receiver_id: new ObjectId(receiver_id),
      content: content
    })
    const result = await databaseService.conversations.insertOne(conversation)
    console.log(result)
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
httpServer.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
