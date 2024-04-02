import { Router } from 'express'
import { accessTokenValidator, loginValidator, registerValidator } from '../middlewares/users.middlewares'
import { loginController, registerController } from '~/controllers/users.controllers'
import { wrapRequestHandler } from '~/utils/handlers'
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
router.post(
  '/logout',
  accessTokenValidator,
  wrapRequestHandler((req, res) => {
    res.json({ message: 'Logout success' })
  })
)
export default router
