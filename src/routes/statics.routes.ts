import { Router } from 'express'
import { servingVideoStreamController } from '~/controllers/statics.controllers'
const staticsRouter = Router()
staticsRouter.get('/video-stream/:name', servingVideoStreamController)
export default staticsRouter
