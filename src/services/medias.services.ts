import { getNameFromFullName, handleUploadImage } from '~/utils/file'
import sharp from 'sharp'
import { Request } from 'express'
import path from 'path'
import { UPLOAD_DIR } from '~/constants/dir'
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
        const newPath = path.resolve(UPLOAD_DIR, `${newName}.jpg`)
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
}
const mediaService = new MediaService()
export default mediaService
