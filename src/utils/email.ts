import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import path from 'path'
import fs from 'fs'
import { envConfig } from '~/constants/config'

// Create SES service object.
const sesClient = new SESClient({
  region: envConfig.awsRegion || '',
  credentials: {
    secretAccessKey: envConfig.awsSecretAccessKey || '',
    accessKeyId: envConfig.awsAccessKeyId || ''
  }
})

const createSendEmailCommand = ({
  fromAddress,
  toAddresses,
  ccAddresses = [],
  body,
  subject,
  replyToAddresses = []
}: {
  fromAddress: string
  toAddresses: string | string[]
  ccAddresses?: string | string[]
  body: string
  subject: string
  replyToAddresses?: string | string[]
}) => {
  return new SendEmailCommand({
    Destination: {
      /* required */
      CcAddresses: ccAddresses instanceof Array ? ccAddresses : [ccAddresses],
      ToAddresses: toAddresses instanceof Array ? toAddresses : [toAddresses]
    },
    Message: {
      /* required */
      Body: {
        /* required */
        Html: {
          Charset: 'UTF-8',
          Data: body
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject
      }
    },
    Source: fromAddress,
    ReplyToAddresses: replyToAddresses instanceof Array ? replyToAddresses : [replyToAddresses]
  })
}

const sendVerifyEmail = (toAddress: string, subject: string, body: string) => {
  const sendEmailCommand = createSendEmailCommand({
    fromAddress: envConfig.sesFromAddress as string,
    toAddresses: toAddress,
    body,
    subject
  })
  return sesClient.send(sendEmailCommand)
}
// console.log(path.resolve('src/templates/send-email.html'))
const emailTemplate = fs.readFileSync(path.resolve('src/templates/send-email.html'), 'utf8')
export const sendVerifyRegisterEmail = (
  toAddress: string,
  email_verify_token: string,
  templates: string = emailTemplate
) => {
  return sendVerifyEmail(
    toAddress,
    'Verify your email',
    templates
      .replace('{{content}}', 'verify-email')
      .replace('{{link}}', `https://${envConfig.clientUrl}/verify-email?token=${email_verify_token}`)
      .replace('{{button}}', 'Verify email')
  )
}
export const sendVerifyForgotPasswordEmail = (
  toAddress: string,
  forgot_password_token: string,
  templates: string = emailTemplate
) => {
  return sendVerifyEmail(
    toAddress,
    'Reset your password',
    templates
      .replace('{{content}}', 'reset-password')
      .replace('{{link}}', `https://${envConfig.clientUrl}/verify-email?token=${forgot_password_token}`)
      .replace('{{button}}', 'Reset-password')
  )
}
