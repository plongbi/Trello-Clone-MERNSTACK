import { workspaceModel } from '~/models/workspaceModel'
import { boardModel } from '~/models/boardModel'
import { columnModel } from '~/models/coulmnModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const createNew = async (userId, reqBody) => {
  try {
    const createdWorkspace = await workspaceModel.createNew(userId, reqBody)
    const getNewWorkspace = await workspaceModel.findOneById(createdWorkspace.insertedId)
    return getNewWorkspace
  } catch (error) { throw error }
}

const getWorkspaces = async (userId) => {
  try {
    const workspaces = await workspaceModel.getWorkspacesByUserId(userId)
    return workspaces
  } catch (error) { throw error }
}

const getDetails = async (userId, workspaceId) => {
  try {
    const workspace = await workspaceModel.getDetails(userId, workspaceId)
    if (!workspace) throw new ApiError(StatusCodes.NOT_FOUND, 'Workspace not found!')
    return workspace
  } catch (error) { throw error }
}

const update = async (userId, workspaceId, reqBody) => {
  try {
    const existWorkspace = await workspaceModel.findOneById(workspaceId)
    if (!existWorkspace) throw new ApiError(StatusCodes.NOT_FOUND, 'Workspace not found!')
    if (existWorkspace._destroy) throw new ApiError(StatusCodes.NOT_FOUND, 'Workspace has been deleted!')

    // Chỉ owner mới có quyền update
    const isOwner = existWorkspace.ownerIds
      .map(id => id.toString())
      .includes(userId.toString())
    if (!isOwner) throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to update this workspace!')

    const updatedWorkspace = await workspaceModel.update(workspaceId, reqBody)
    return updatedWorkspace
  } catch (error) { throw error }
}

const deleteWorkspace = async (userId, workspaceId) => {
  try {
    const existWorkspace = await workspaceModel.findOneById(workspaceId)
    if (!existWorkspace) throw new ApiError(StatusCodes.NOT_FOUND, 'Workspace not found!')

    // Chỉ owner mới có quyền xóa
    const isOwner = existWorkspace.ownerIds
      .map(id => id.toString())
      .includes(userId.toString())
    if (!isOwner) throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to delete this workspace!')

    await workspaceModel.deleteOneById(workspaceId)
    return { deleteResult: 'Workspace deleted successfully!' }
  } catch (error) { throw error }
}

// Tạo board mới từ template: tạo board + columns theo cấu trúc mẫu
const createBoardFromTemplate = async (userId, reqBody) => {
  try {
    const { templateColumns, workspaceId, ...boardData } = reqBody

    // Xử lý workspaceId - giữ dạng string/null cho validation
    const boardToCreate = {
      ...boardData,
      workspaceId: workspaceId || null
    }

    const createdBoard = await boardModel.createNew(userId, boardToCreate)
    const newBoard = await boardModel.findOneById(createdBoard.insertedId)

    // Tạo columns từ template nếu có
    if (templateColumns && templateColumns.length > 0) {
      const columnIds = []
      for (const colTitle of templateColumns) {
        const newColumn = {
          boardId: newBoard._id.toString(),
          title: colTitle,
          cardOrderIds: []
        }
        const createdCol = await columnModel.createNew(newColumn)
        const colId = createdCol.insertedId.toString()
        columnIds.push(colId)
        // Gắn column vào board
        await boardModel.pushColumnOrderIds({ boardId: newBoard._id.toString(), _id: createdCol.insertedId })
      }
    }

    const finalBoard = await boardModel.findOneById(newBoard._id)
    return finalBoard
  } catch (error) { throw error }
}

export const workspaceService = {
  createNew,
  getWorkspaces,
  getDetails,
  update,
  deleteWorkspace,
  createBoardFromTemplate
}
