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
import { Server } from 'socket.io'
import './utils/s3'
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'
import './utils/file'
import { envConfig, isProduction } from './constants/config'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
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
// Connect to MongoDB
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
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false // Disable the `X-RateLimit-*` headers.
  // store: ... , // Redis, Memcached, etc. See below.
})

// Apply the rate limiting middleware to all requests.
app.use(limiter)
// Init folder for upload
initFolder()
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification))
app.use('/users', userRouter)
app.use('/medias', mediasRouter)
app.use('/statics/', staticsRouter)
app.use('/tweets', tweetsRouter)
app.use('/bookmarks', bookmarksRoutes)
app.use('/likes/', likesRoutes)
app.use('/search', searchRoutes)
app.use('/static', staticsRouter)

// Defaut error handler
app.use(defaultErrorHandler)
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173'
  }
})
const users: {
  [key: string]: {
    socket_id: string
  }
} = {}
// io.on('connection', (socket) => {
//   console.log(`user ${socket.id} connected`)
//   const user_id = socket.handshake.auth._id as string
//   users[user_id] = {
//     socket_id: socket.id
//   }
//   socket.on('private message', (data) => {
//     const receiver_socket_id = users[data.to].socket_id
//     socket.to(receiver_socket_id).emit('receive private message', {
//       content: data.content,
//       from: user_id
//     })
//   })
// })

httpServer.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

