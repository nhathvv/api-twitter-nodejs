import { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import formidable, { File } from 'formidable'
import { UPLOAD_TEMP_DIR } from '~/constants/dir'

export const initFolder = () => {
  const uploadFolderPath = UPLOAD_TEMP_DIR
  if (!fs.existsSync(uploadFolderPath)) {
    fs.mkdirSync(uploadFolderPath, { recursive: true })
  }
}
export const handleUploadImage = (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_TEMP_DIR,
    keepExtensions: true,
    maxFileSize: 3 * 1024 * 1024,
    maxFiles: 4,
    maxTotalFileSize: 12 * 1024 * 1024,
    filter: function ({ name, originalFilename, mimetype }) {
      const isValid = name === 'image' && Boolean(mimetype?.includes('image'))
      if (!isValid) {
        form.emit('error' as any, new Error('Invalid file type') as any)
      }
      return isValid
    }
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      if (!files.image) {
        return reject(new Error('No image uploaded'))
      }
      return resolve(files.image as File[])
    })
  })
}
export const getNameFromFullName = (filename: string) => {
  const filename_arr = filename.split('.')
  filename_arr.pop()
  return filename_arr.join('')
}
