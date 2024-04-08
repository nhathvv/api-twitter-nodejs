import { Router } from 'express'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  updateMeValidator,
  verifiedUserValidator,
  verifyForgotPasswordTokenValidator
} from '../middlewares/users.middlewares'
import {
  forgotPasswordController,
  getMeController,
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  resendVerifyEmailController,
  resetPasswordController,
  updateMeController,
  verifyEmailController,
  verifyForgotPasswordTokenController
} from '~/controllers/users.controllers'
import { wrapRequestHandler } from '~/utils/handlers'
import { get } from 'lodash'
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
/**
 * Description. Refresh access token
 * Path: /refresh_token
 * Method: POST
 * Body : {refresh_token : string}
 */
router.post('/refresh-token', refreshTokenValidator, wrapRequestHandler(refreshTokenController))
/**
 * Description. Verify email user click on link in email
 * Path: /verify_email
 * Method: POST
 * Body : {email_verify_token : string}
 */
router.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(verifyEmailController))
/**
 * Description. Resend verify email
 * Path: /resend_verify_email
 * Method: POST
 * Headers : {Authorization: Bearer <access_token>}
 */
router.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendVerifyEmailController))
/**
 * Description. Forgot password
 * Path: /forgot_password
 * Method: POST
 * Body : {email : string}
 */
router.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))
/**
 * Description. Verify forgot password token when user click on link in e=mail
 * Path: /verify_forgot_password
 * Method: POST
 * Body : {forgot_password_token : string}
 */
router.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapRequestHandler(verifyForgotPasswordTokenController)
)
/**
 * Description. Reset password
 * Path: /reset_password
 * Method: POST
 * Body : {forgot_password_token : string, password : string, confirm_password : string}
 */
router.post('/reset-password', resetPasswordValidator, wrapRequestHandler(resetPasswordController))
/**
 * Description. Get user info
 * Path: /me
 * Method: GET
 * Headers : {Authorization : Bearer <access_token>}
 */
router.get('/me', accessTokenValidator, wrapRequestHandler(getMeController))
router.patch(
  '/me',
  accessTokenValidator,
  verifiedUserValidator,
  updateMeValidator,
  wrapRequestHandler(updateMeController)
)
export default router
