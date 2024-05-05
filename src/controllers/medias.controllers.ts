import { Request, Response } from 'express'
import formidable from 'formidable'
import path from 'path'
export const uploadSingleImageController = async (req: Request, res: Response) => {
  const form = formidable({
    uploadDir: path.resolve('uploads'),
    keepExtensions: true,
    maxFileSize: 3 * 1024 * 1024,
    maxFiles: 1
  })
  form.parse(req, (err, fields, files) => {
    if (err) {
      throw err
    }
    return res.status(200).json({ message: 'Upload single image success' })
  })
}
