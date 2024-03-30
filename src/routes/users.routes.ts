import { Router } from 'express'
import { loginValidator, registerValidator } from '../middlewares/users.middlewares'
import { loginController, registerController } from '~/controllers/users.controllers'
const router = Router()

router.post('/login', loginValidator, loginController)
router.post('/register', registerValidator, registerController)
export default router
