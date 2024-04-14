import { Router } from 'express'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  followValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  unfollowValidator,
  updateMeValidator,
  verifiedUserValidator,
  verifyForgotPasswordTokenValidator
} from '../middlewares/users.middlewares'
import {
  followController,
  forgotPasswordController,
  getMeController,
  getProfileController,
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  resendVerifyEmailController,
  resetPasswordController,
  unfollowController,
  updateMeController,
  verifyEmailController,
  verifyForgotPasswordTokenController
} from '~/controllers/users.controllers'
import { wrapRequestHandler } from '~/utils/handlers'
import { get } from 'lodash'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import { updateMeReqBody } from '~/models/requests/Users.request'
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
/**
 * Description. Update user info
 * Path: /me
 * Method: PATCH
 * Headers : {Authorization : Bearer <access_token>}
 */
router.patch(
  '/me',
  accessTokenValidator,
  verifiedUserValidator,
  updateMeValidator,
  filterMiddleware<updateMeReqBody>([
    'name',
    'date_of_birth',
    'bio',
    'location',
    'website',
    'avatar',
    'username',
    'cover_photo'
  ]),
  wrapRequestHandler(updateMeController)
)
/**
 * Description. Get user profile
 * Path: /:username
 * Method: GET
 */
router.get('/:username', wrapRequestHandler(getProfileController))
/**
 * Description. Follow user
 * Path: /follow
 * Method: POST
 * Headers : {Authorization : Bearer <access_token>}
 */
router.post(
  '/follow',
  accessTokenValidator,
  verifiedUserValidator,
  followValidator,
  wrapRequestHandler(followController)
)
/**
 * Description. Unfollow user
 * Path: /follow/:user_id
 * Method: DELETE
 * Headers : {Authorization : Bearer <access_token>}
 * Params : {user_id : string}
 */
router.delete(
  '/follow/:user_id',
  accessTokenValidator,
  verifiedUserValidator,
  unfollowValidator,
  wrapRequestHandler(unfollowController)
)
export default router
