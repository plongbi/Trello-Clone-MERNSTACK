import { StatusCodes } from 'http-status-codes'
import { workspaceService } from '../services/workspaceService.js'

const createNew = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const createdWorkspace = await workspaceService.createNew(userId, req.body)
    res.status(StatusCodes.CREATED).json(createdWorkspace)
  } catch (error) { next(error) }
}

const getWorkspaces = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const workspaces = await workspaceService.getWorkspaces(userId)
    res.status(StatusCodes.OK).json(workspaces)
  } catch (error) { next(error) }
}

const getDetails = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const workspaceId = req.params.id
    const workspace = await workspaceService.getDetails(userId, workspaceId)
    res.status(StatusCodes.OK).json(workspace)
  } catch (error) { next(error) }
}

const update = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const workspaceId = req.params.id
    const updatedWorkspace = await workspaceService.update(userId, workspaceId, req.body)
    res.status(StatusCodes.OK).json(updatedWorkspace)
  } catch (error) { next(error) }
}

const deleteWorkspace = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const workspaceId = req.params.id
    const result = await workspaceService.deleteWorkspace(userId, workspaceId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const createBoardFromTemplate = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const result = await workspaceService.createBoardFromTemplate(userId, req.body)
    res.status(StatusCodes.CREATED).json(result)
  } catch (error) { next(error) }
}

export const workspaceController = {
  createNew,
  getWorkspaces,
  getDetails,
  update,
  deleteWorkspace,
  createBoardFromTemplate
}
