import { Request, Response } from 'express'
import fs from 'fs'
import formidable, { File } from 'formidable'
import { UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR } from '~/constants/dir'
import path from 'path'
export const initFolder = () => {
  ;[UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_TEMP_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  })
}
export const handleUploadImage = (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_IMAGE_TEMP_DIR,
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
export const handleUploadVideo = async (req: Request) => {
  const nanoid = (await import('nanoid')).nanoid
  const idName = nanoid()
  const folderPath = path.resolve(UPLOAD_VIDEO_DIR, idName)
  fs.mkdirSync(folderPath, { recursive: true })
  const form = formidable({
    uploadDir: folderPath,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024,
    maxFiles: 4,
    maxTotalFileSize: 12 * 1024 * 1024,
    filter: function ({ name, originalFilename, mimetype }) {
      const isValid = name === 'video' && Boolean(mimetype?.includes('mp4') || mimetype?.includes('quicktime'))
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
      if (!files.video) {
        return reject(new Error('No video uploaded'))
      }
      return resolve(files.video as File[])
    })
  })
}
export const getNameFromFullName = (filename: string) => {
  const filename_arr = filename.split('.')
  filename_arr.pop()
  return filename_arr.join('')
}
