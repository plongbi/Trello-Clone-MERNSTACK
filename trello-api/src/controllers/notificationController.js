import { StatusCodes } from 'http-status-codes'
import { notificationService } from '~/services/notificationService'

const getByUser = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const results = await notificationService.getByUser(userId)
    res.status(StatusCodes.OK).json(results)
  } catch (error) { next(error) }
}

const markAsRead = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const notificationId = req.params.id
    const result = await notificationService.markAsRead(notificationId, userId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const result = await notificationService.markAllAsRead(userId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

export const notificationController = {
  getByUser,
  markAsRead,
  markAllAsRead
}
