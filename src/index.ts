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
import conversationsRoutes from './routes/conversations.routes'
import initSocket from './utils/socket'
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
const httpServer = createServer(app)
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
initSocket(httpServer)
httpServer.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
