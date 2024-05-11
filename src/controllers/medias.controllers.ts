import { Request, Response } from 'express'
import USERS_MESSAGES from '~/constants/messages'
import mediaService from '~/services/medias.services'
export const uploadImageController = async (req: Request, res: Response) => {
  const result = await mediaService.uploadImage(req)
  return res.status(200).json({ message: USERS_MESSAGES.UPLOAD_IMAGE_SUCCESS, result })
}
export const uploadVideoController = async (req: Request, res: Response) => {
  const result = await mediaService.uploadVideo(req)
  return res.status(200).json({ message: USERS_MESSAGES.UPLOAD_VIDEO_SUCCESS, result })
}
export const uploadVideoHLSController = async (req: Request, res: Response) => {
  const result = await mediaService.uploadVideoHLS(req)
  return res.status(200).json({ message: USERS_MESSAGES.UPLOAD_VIDEO_SUCCESS, result })
}
