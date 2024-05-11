import { Router } from 'express'
import {
  servingM3U8Controller,
  servingSegmentController,
  servingVideoStreamController
} from '~/controllers/statics.controllers'
const staticsRouter = Router()
staticsRouter.get('/video-stream/:name', servingVideoStreamController)
staticsRouter.get('/video-hls/:id/master.m3u8', servingM3U8Controller)
staticsRouter.get('/video-hls/:id/:v/:segment', servingSegmentController)
export default staticsRouter
