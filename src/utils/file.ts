import { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import formidable from 'formidable'

export const initFolder = () => {
  const uploadFolderPath = path.resolve('uploads')
  if (!fs.existsSync(uploadFolderPath)) {
    fs.mkdirSync(uploadFolderPath, { recursive: true })
  }
}
export const handleUploadSingleImage = (req: Request) => {
  const form = formidable({
    uploadDir: path.resolve('uploads'),
    keepExtensions: true,
    maxFileSize: 3 * 1024 * 1024,
    maxFiles: 1,
    filter: function ({ name, originalFilename, mimetype }) {
      const isValid = name === 'image' && Boolean(mimetype?.includes('image'))
      if (!isValid) {
        form.emit('error' as any, new Error('Invalid file type') as any)
      }
      return isValid
    }
  })
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      if (!files.image) {
        return reject(new Error('No image uploaded'))
      }
      return resolve(files)
    })
  })
}
