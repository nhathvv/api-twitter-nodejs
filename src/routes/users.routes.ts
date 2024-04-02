import { Router } from 'express'
import {
  accessTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator
} from '../middlewares/users.middlewares'
import { loginController, logoutController, registerController } from '~/controllers/users.controllers'
import { wrapRequestHandler } from '~/utils/handlers'
import { log } from 'console'
const router = Router()

/**
 * Description. Login user
 * Path: /login
 * Method: POST
 * Body : {email : string, password : string}
 */
router.post('/login', loginValidator, wrapRequestHandler(loginController))
/**
 * Description. Register new user
 * Path: /register
 * Method: POST
 * Body : {name : string, email : string, password : string, date_of_birth : Date}
 */
router.post('/register', registerValidator, wrapRequestHandler(registerController))
/**
 * Description. Logout user
 * Path: /logout
 * Method: POST
 * Headers : {Authorization : Bearer <access_token>}
 * Body : {}
 */
router.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))
export default router
