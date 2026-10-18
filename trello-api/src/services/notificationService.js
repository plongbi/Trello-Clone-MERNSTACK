import { notificationModel } from '~/models/notificationModel'

const getByUser = async (userId) => {
  try {
    return await notificationModel.getByUser(userId)
  } catch (error) { throw error }
}

const markAsRead = async (notificationId, userId) => {
  try {
    return await notificationModel.markAsRead(notificationId, userId)
  } catch (error) { throw error }
}

const markAllAsRead = async (userId) => {
  try {
    return await notificationModel.markAllAsRead(userId)
  } catch (error) { throw error }
}

export const notificationService = {
  getByUser,
  markAsRead,
  markAllAsRead
}
