import { getFiles, getFolderPath, getNameFromFullName, handleUploadImage, handleUploadVideo } from '~/utils/file'
import sharp from 'sharp'
import { Request } from 'express'
import path from 'path'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import { isProduction } from '~/constants/config'
import { config } from 'dotenv'
import { EncodingStatus, MediaTypes } from '~/constants/enums'
import { Media } from '~/models/Others'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'
import { promises as fsPromise } from 'fs'
import databaseService from './database.services'
import { VideoStatus } from '~/models/schemas/VideoStatus.schema'
import { uploadFileToS3 } from '~/utils/s3'
import mimeTypes from 'mime-types'
import { CompleteMultipartUploadCommandOutput } from '@aws-sdk/client-s3'
import { rimraf, rimrafSync } from 'rimraf'
config()
class Queue {
  items: string[]
  encoding: boolean
  constructor() {
    this.items = []
    this.encoding = false
  }
  async enqueue(item: string) {
    this.items.push(item)
    const idName = getNameFromFullName((item as string).split('/').pop() as string)
    await databaseService.videoStatus.insertOne(new VideoStatus({ name: idName, status: EncodingStatus.Pending }))
    this.processEncode()
  }
  async processEncode() {
    if (this.encoding) return
    if (this.items.length > 0) {
      this.encoding = true
      const videoPath = this.items[0]
      const idName = getFolderPath(videoPath)
      await databaseService.videoStatus.updateOne(
        { name: idName },
        {
          $set: {
            status: EncodingStatus.Processing
          },
          $currentDate: {
            updated_at: true
          }
        }
      )
      try {
        await encodeHLSWithMultipleVideoStreams(videoPath)
        await fsPromise.unlink(videoPath)
        const files = getFiles(path.resolve(UPLOAD_VIDEO_DIR, ''))
        await Promise.all([
          files.map((filepath) => {
            const filename = filepath.replace(UPLOAD_VIDEO_DIR, '')
            return uploadFileToS3({
              filename: 'video-hls' + filename,
              filepath: filepath,
              contentType: mimeTypes.lookup(filepath) || 'video/mp4'
            })
          })
        ])
        await databaseService.videoStatus.updateOne(
          { name: idName },
          {
            $set: {
              status: EncodingStatus.Success
            },
            $currentDate: {
              updated_at: true
            }
          }
        )
        this.items.shift()
        this.encoding = false
        console.log(`Encode ${videoPath} success`)
        const nameFolder = getFolderPath(videoPath)
        rimrafSync(path.resolve(UPLOAD_VIDEO_DIR, nameFolder))
        await this.processEncode()
      } catch (error) {
        await databaseService.videoStatus
          .updateOne(
            { name: idName },
            {
              $set: {
                status: EncodingStatus.Failed
              },
              $currentDate: {
                updated_at: true
              }
            }
          )
          .catch((error) => {
            console.error('Error while updating video status', error)
          })
      }
    } else {
      console.log('Queue is empty')
    }
  }
}
const queue = new Queue()
class MediaService {
  async uploadImage(req: Request) {
    const files = await handleUploadImage(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullName(file.newFilename)
        const newFullName = `${newName}.jpg`
        const newPath = path.join(UPLOAD_IMAGE_DIR, newFullName)
        await sharp(file.filepath).jpeg({}).toFile(newPath)
        const s3Result = await uploadFileToS3({
          filename: 'images/' + newFullName,
          filepath: newPath,
          contentType: mimeTypes.lookup(newPath) || 'image/jpeg'
        })
        await Promise.all([fsPromise.unlink(file.filepath), fsPromise.unlink(newPath)])
        return {
          url: (s3Result as CompleteMultipartUploadCommandOutput).Location as string,
          type: MediaTypes.Image
        }
      })
    )
    return result
  }
  async uploadVideo(req: Request) {
    const files = await handleUploadVideo(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const s3Result = await uploadFileToS3({
          filename: 'videos/' + file.newFilename,
          filepath: file.filepath,
          contentType: mimeTypes.lookup(file.filepath) || 'video/mp4'
        })
        return {
          url: (s3Result as CompleteMultipartUploadCommandOutput).Location as string,
          type: MediaTypes.Video
        }
      })
    )
    return result
  }
  async uploadVideoHLS(req: Request) {
    const files = await handleUploadVideo(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        queue.enqueue(file.filepath)
        const newFolder = getFolderPath(file.filepath)
        return {
          url: isProduction
            ? `${process.env.HOST}/medias/video-hls/${newFolder}/master.m3u8`
            : `http://localhost:4000/static/video-hls/${newFolder}/master.m3u8`,
          type: MediaTypes.HLS
        }
      })
    )
    return result
  }
  async getVideoStatus(id: string) {
    const data = await databaseService.videoStatus.findOne({ name: id })
    return data
  }
}
const mediaService = new MediaService()
export default mediaService
