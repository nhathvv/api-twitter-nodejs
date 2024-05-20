import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import dotenv from 'dotenv'
import fs from 'fs'
import HTTP_STATUS from '~/constants/httpStatus'
import { Response } from 'express'
dotenv.config()
const s3 = new S3Client({
  region: process.env.AWS_REGION as string,
  credentials: {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string
  }
})
export const uploadFileToS3 = async ({
  filename,
  filepath,
  contentType
}: {
  filename: string
  filepath: string
  contentType: string
}) => {
  const path = fs.createReadStream(filepath)
  const parallelUploads3 = new Upload({
    client: s3,
    params: { Bucket: 'twitter-nhathv-ap-southeast-1', Key: filename, Body: path, ContentType: contentType },
    tags: [
      /*...*/
    ], // optional tags
    queueSize: 4, // optional concurrency configuration
    partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
    leavePartsOnError: false // optional manually handle dropped parts
  })
  return parallelUploads3.done()
}
export const sendFileFromS3 = async (res: Response, filename: string) => {
  try {
    const cmd = new GetObjectCommand({
      Bucket: 'twitter-nhathv-ap-southeast-1',
      Key: filename
    })
    const data = await s3.send(cmd)
    ;(data.Body as any).pipe(res)
  } catch (error) {
    res.status(HTTP_STATUS.NOT_FOUND).send('File not found')
  }
}
