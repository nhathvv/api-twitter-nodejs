import e, { Request, Response } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import path from 'path'
import { UPLOAD_VIDEO_DIR } from '~/constants/dir'
import fs from 'fs'
import mime from 'mime-types'
import { sendFileFromS3 } from '~/utils/s3'

export const servingVideoStreamController = async (req: Request, res: Response) => {
  const range = req.headers.range
  if (!range) {
    return res.status(HTTP_STATUS.BAD_REQUEST).send('Requires Range header')
  }
  const { name } = req.params
  const videoPath = path.resolve(UPLOAD_VIDEO_DIR, name)
  const videoSize = fs.statSync(videoPath).size
  const CHUNK_SIZE = 10 ** 6 // 1MB
  const start = Number(range.replace(/\D/g, '')) // 0
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1)
  const contentLength = end - start + 1
  const contentType = mime.contentType(videoPath) || 'video/mp4'
  res.writeHead(HTTP_STATUS.PARTIAL_CONTENT, {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': contentType
  })
  const videoStreams = fs.createReadStream(videoPath, { start, end })
  videoStreams.pipe(res)
}
export const servingM3U8Controller = async (req: Request, res: Response) => {
  const { id } = req.params
  sendFileFromS3(res, `video-hls/${id}/master.m3u8`)
}
export const servingSegmentController = async (req: Request, res: Response) => {
  const { id, v, segment } = req.params
  sendFileFromS3(res, `video-hls/${id}/${v}/${segment}`)
}
