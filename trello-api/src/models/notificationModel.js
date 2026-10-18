import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { userModel } from './userModel'

const NOTIFICATION_COLLECTION_NAME = 'notifications'
const NOTIFICATION_COLLECTION_SCHEMA = Joi.object({
  senderId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  recipientId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  type: Joi.string().valid('CARD_COMMENTED', 'CARD_MEMBER_ADDED', 'CARD_DEADLINE_WARNING').required(),

  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  cardId: Joi.string().optional().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

  title: Joi.string().required().trim().strict(),
  message: Joi.string().required().trim().strict(),
  isRead: Joi.boolean().default(false),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ['_id', 'senderId', 'recipientId', 'type', 'createdAt']

const validateBeforeCreate = async (data) => {
  return await NOTIFICATION_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const newNotificationToAdd = {
      ...validData,
      senderId: new ObjectId(validData.senderId),
      recipientId: new ObjectId(validData.recipientId),
      boardId: new ObjectId(validData.boardId)
    }

    if (validData.cardId) {
      newNotificationToAdd.cardId = new ObjectId(validData.cardId)
    }

    const createdNotification = await GET_DB().collection(NOTIFICATION_COLLECTION_NAME).insertOne(newNotificationToAdd)
    return createdNotification
  } catch (error) { throw new Error(error) }
}

const findOneById = async (notificationId) => {
  try {
    const result = await GET_DB().collection(NOTIFICATION_COLLECTION_NAME).findOne({ _id: new ObjectId(notificationId) })
    return result
  } catch (error) { throw new Error(error) }
}

const getByUser = async (userId) => {
  try {
    const queryConditions = [
      { recipientId: new ObjectId(userId) },
      { _destroy: false }
    ]

    const results = await GET_DB().collection(NOTIFICATION_COLLECTION_NAME).aggregate([
      { $match: { $and: queryConditions } },
      { $sort: { createdAt: -1 } },
      { $lookup: {
        from: userModel.USER_COLLECTION_NAME,
        localField: 'senderId',
        foreignField: '_id',
        as: 'sender',
        pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
      } },
      { $unwind: { path: '$sender', preserveNullAndEmptyArrays: true } }
    ]).toArray()
    return results
  } catch (error) { throw new Error(error) }
}

const update = async (notificationId, updateData) => {
  try {
    Object.keys(updateData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    const result = await GET_DB().collection(NOTIFICATION_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(notificationId) },
      { $set: updateData },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

const markAsRead = async (notificationId, userId) => {
  try {
    const result = await GET_DB().collection(NOTIFICATION_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(notificationId), recipientId: new ObjectId(userId) },
      { $set: { isRead: true, updatedAt: Date.now() } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

const markAllAsRead = async (userId) => {
  try {
    const result = await GET_DB().collection(NOTIFICATION_COLLECTION_NAME).updateMany(
      { recipientId: new ObjectId(userId), isRead: false },
      { $set: { isRead: true, updatedAt: Date.now() } }
    )
    return result
  } catch (error) { throw new Error(error) }
}

export const notificationModel = {
  NOTIFICATION_COLLECTION_NAME,
  NOTIFICATION_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getByUser,
  update,
  markAsRead,
  markAllAsRead
}
