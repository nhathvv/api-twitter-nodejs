import { getNameFromFullName, handleUploadSingleImage } from '~/utils/file'
import sharp from 'sharp'
import { Request } from 'express'
import path from 'path'
import { UPLOAD_DIR } from '~/constants/dir'
import fs from 'fs'
import { isProduction } from '~/constants/config'
import { config } from 'dotenv'
config()
class MediaService {
  async handleUploadSingleImage(req: Request) {
    const file = await handleUploadSingleImage(req)
    const newName = getNameFromFullName(file.newFilename)
    const newPath = path.resolve(UPLOAD_DIR, `${newName}.jpg`)
    await sharp(file.filepath).jpeg({}).toFile(newPath)
    fs.unlinkSync(file.filepath)
    return isProduction ? `${process.env.HOST}/medias/${newName}.jpg` : `http://localhost:4000/static/${newName}.jpg`
  }
}
const mediaService = new MediaService()
export default mediaService
