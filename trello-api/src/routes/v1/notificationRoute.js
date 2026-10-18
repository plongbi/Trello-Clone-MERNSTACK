import express from 'express'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { notificationValidation } from '~/validations/notificationValidation'
import { notificationController } from '~/controllers/notificationController'

const Router = express.Router()

Router.route('/')
  .get(authMiddleware.isAuthorized, notificationController.getByUser)

Router.route('/read-all')
  .put(authMiddleware.isAuthorized, notificationController.markAllAsRead)

Router.route('/:id/read')
  .put(authMiddleware.isAuthorized, notificationValidation.markAsRead, notificationController.markAsRead)

export const notificationRoute = Router
