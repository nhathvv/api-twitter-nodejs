import { getNameFromFullName, handleUploadImage, handleUploadVideo } from '~/utils/file'
import sharp from 'sharp'
import { Request } from 'express'
import path from 'path'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import fs from 'fs'
import { isProduction } from '~/constants/config'
import { config } from 'dotenv'
import { MediaTypes } from '~/constants/enums'
import { Media } from '~/models/Others'
config()
class MediaService {
  async uploadImage(req: Request) {
    const files = await handleUploadImage(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullName(file.newFilename)
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, `${newName}.jpg`)
        await sharp(file.filepath).jpeg({}).toFile(newPath)
        fs.unlinkSync(file.filepath)
        return {
          url: isProduction
            ? `${process.env.HOST}/medias/${newName}.jpg`
            : `http://localhost:4000/static/${newName}.jpg`,
          type: MediaTypes.Image
        }
      })
    )
    return result
  }
  async uploadVideo(req: Request) {
    const videos = await handleUploadVideo(req)
    const result: Media[] = await Promise.all(
      videos.map(async (video) => {
        return {
          url: isProduction
            ? `${process.env.HOST}/medias/${video.newFilename}`
            : `http://localhost:4000/static/video/${video.newFilename}`,
          type: MediaTypes.Video
        }
      })
    )
    return result
  }
}
const mediaService = new MediaService()
export default mediaService
