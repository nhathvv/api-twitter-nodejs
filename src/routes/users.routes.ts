import { Router } from 'express'
import { loginValidator, registerValidator } from '../middlewares/users.middlewares'
import { loginController, registerController } from '~/controllers/users.controllers'
import { wrapAsync } from '~/utils/handlers'
const router = Router()

/**
 * Description. Login user
 * Path: /login
 * Method: POST
 * Body : {email : string, password : string}
 */
router.post('/login', loginValidator, wrapAsync(loginController))
/**
 * Description. Register new user
 * Path: /register
 * Method: POST
 * Body : {name : string, email : string, password : string, date_of_birth : Date}
 */
router.post('/register', registerValidator, wrapAsync(registerController))
export default router
