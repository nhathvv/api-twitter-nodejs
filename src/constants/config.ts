import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'
const env = process.env.NODE_ENV
const envFilename = `.env.${env}`
if (!env) {
  process.exit(1)
}
if (!fs.existsSync(path.resolve(envFilename))) {
  process.exit(1)
}
config({
  path: envFilename
})
export const isProduction = env === 'production'

export const envConfig = {
  port: process.env.PORT,
  host: process.env.HOST,

  dbUsername: process.env.DB_USERNAME,
  dbPassword: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,
  passwordSecret: process.env.PASSWORD_SECRET,

  jwtSecretAccessToken: process.env.JWT_SECRET_ACCESS_TOKEN,
  jwtSecretRefreshToken: process.env.JWT_SECRET_REFRESH_TOKEN,
  jwtSecretEmailVerifyToken: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN,
  jwtForgotPasswordToken: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN,

  expiresInAccessToken: process.env.EXPIRES_IN_ACCESS_TOKEN,
  expiresInRefreshToken: process.env.EXPIRES_IN_REFRESH_TOKEN,
  expiresInEmailVerifyToken: process.env.EXPIRES_IN_EMAIL_VERIFY_TOKEN,
  expiresInForgotPasswordToken: process.env.EXPIRES_IN_FORGOT_PASSWORD_TOKEN,

  dbUserCollection: process.env.DB_COLLECTION_USER,
  dbRefreshTokenCollection: process.env.DB_COLLECTION_REFRESH_TOKEN,
  dbFollowerCollection: process.env.DB_COLLECTION_FOLLOWER,
  dbVideoStatusCollection: process.env.DB_COLLECTION_VIDEO_STATUS,
  dbTweetCollection: process.env.DB_COLLECTION_TWEET,
  dbHashtagCollection: process.env.DB_COLLECTION_HASHTAG,
  dbBookmarkCollection: process.env.DB_COLLECTION_BOOKMARK,
  dbLikeCollection: process.env.DB_COLLECTION_LIKE,
  dbConversationCollection: process.env.DB_COLLECTION_CONVERSATION,

  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI,
  clientRedirectCallback: process.env.CLIENT_REDIRECT_CALLBACK,
  clientUrl: process.env.CLIENT_URL,

  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  awsRegion: process.env.AWS_REGION,
  sesFromAddress: process.env.SES_FROM_ADDRESS
}
