import { Router } from 'express'
import { loginValidator } from '../middlewares/users.middlewares'
import { loginController } from '~/controllers/users.controllers'
const router = Router()

router.post('/login', loginValidator, loginController)
export default router
