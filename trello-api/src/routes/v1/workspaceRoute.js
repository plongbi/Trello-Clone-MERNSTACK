import express from 'express'
import { workspaceValidation } from '~/validations/workspaceValidation'
import { workspaceController } from '~/controllers/workspaceController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

// GET all workspaces / POST create new workspace
Router.route('/')
  .get(authMiddleware.isAuthorized, workspaceController.getWorkspaces)
  .post(authMiddleware.isAuthorized, workspaceValidation.createNew, workspaceController.createNew)

// GET workspace details / PUT update / DELETE soft delete
Router.route('/:id')
  .get(authMiddleware.isAuthorized, workspaceController.getDetails)
  .put(authMiddleware.isAuthorized, workspaceValidation.update, workspaceController.update)
  .delete(authMiddleware.isAuthorized, workspaceController.deleteWorkspace)

// POST tạo board từ template (có columns sẵn)
Router.route('/board-from-template')
  .post(authMiddleware.isAuthorized, workspaceController.createBoardFromTemplate)

export const workspaceRoute = Router
