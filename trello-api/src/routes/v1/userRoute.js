import express from 'express'
import { userValidation } from '~/validations/userValidation'
import { userController } from '~/controllers/userController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { multerUploadMiddleware } from '~/middlewares/multerUploadMiddleware'

const Router = express.Router()

Router.route('/register')
  .post(userValidation.createNew, userController.createNew)

Router.route('/verify')
  .put(userValidation.verifyAccount, userController.verifyAccount)

Router.route('/login')
  .post(userValidation.login, userController.login)

Router.route('/logout')
  .delete(userController.logout)

Router.route('/refresh-token')
  .get(userController.refreshToken)

Router.route('/update')
  .put(
    authMiddleware.isAuthorized,
    multerUploadMiddleware.upload.single('avatar'),
    userValidation.update,
    userController.update
  )

// Recent boards - GET lịch sử truy cập
Router.route('/recent-boards')
  .get(authMiddleware.isAuthorized, userController.getRecentBoards)

// Track khi user mở một board
Router.route('/recent-boards/:boardId')
  .post(authMiddleware.isAuthorized, userController.trackRecentBoard)

// Starred boards - GET danh sách boards đã star
Router.route('/starred-boards')
  .get(authMiddleware.isAuthorized, userController.getStarredBoards)

// Toggle star/unstar một board
Router.route('/starred-boards/:boardId/toggle')
  .patch(authMiddleware.isAuthorized, userController.toggleStarBoard)

export const userRoute = Router