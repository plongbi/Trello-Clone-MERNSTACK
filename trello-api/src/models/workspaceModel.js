import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'
import { slugify } from '~/utils/formatters'
import { boardModel } from './boardModel'
import { userModel } from './userModel'

const WORKSPACE_COLLECTION_NAME = 'workspaces'

const WORKSPACE_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private'
}

const WORKSPACE_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().allow('').max(256).trim().default(''),
  type: Joi.string().valid(WORKSPACE_TYPES.PUBLIC, WORKSPACE_TYPES.PRIVATE).default(WORKSPACE_TYPES.PUBLIC),
  logo: Joi.string().allow(null).default(null), // emoji hoặc URL ảnh
  color: Joi.string().default('#0052CC'), // Màu đại diện workspace

  ownerIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  memberIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']

const validateBeforeCreate = async (data) => {
  return await WORKSPACE_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (userId, data) => {
  try {
    const validData = await validateBeforeCreate({
      ...data,
      slug: slugify(data.title)
    })
    const newWorkspaceToAdd = {
      ...validData,
      ownerIds: [new ObjectId(userId)]
    }
    const createdWorkspace = await GET_DB()
      .collection(WORKSPACE_COLLECTION_NAME)
      .insertOne(newWorkspaceToAdd)
    return createdWorkspace
  } catch (error) { throw new Error(error) }
}

const findOneById = async (workspaceId) => {
  try {
    const result = await GET_DB()
      .collection(WORKSPACE_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(workspaceId) })
    return result
  } catch (error) { throw new Error(error) }
}

// Lấy tất cả workspace mà user là owner hoặc member
const getWorkspacesByUserId = async (userId) => {
  try {
    const queryConditions = [
      { _destroy: false },
      {
        $or: [
          { ownerIds: { $all: [new ObjectId(userId)] } },
          { memberIds: { $all: [new ObjectId(userId)] } }
        ]
      }
    ]

    const result = await GET_DB()
      .collection(WORKSPACE_COLLECTION_NAME)
      .aggregate([
        { $match: { $and: queryConditions } },
        { $sort: { title: 1 } },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: 'ownerIds',
            foreignField: '_id',
            as: 'owners',
            pipeline: [{ $project: { password: 0, verifyToken: 0 } }]
          }
        },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: 'memberIds',
            foreignField: '_id',
            as: 'members',
            pipeline: [{ $project: { password: 0, verifyToken: 0 } }]
          }
        }
      ])
      .toArray()

    return result
  } catch (error) { throw new Error(error) }
}

// Lấy chi tiết workspace kèm boards bên trong
const getDetails = async (userId, workspaceId) => {
  try {
    const queryConditions = [
      { _id: new ObjectId(workspaceId) },
      { _destroy: false },
      {
        $or: [
          { ownerIds: { $all: [new ObjectId(userId)] } },
          { memberIds: { $all: [new ObjectId(userId)] } }
        ]
      }
    ]

    const result = await GET_DB()
      .collection(WORKSPACE_COLLECTION_NAME)
      .aggregate([
        { $match: { $and: queryConditions } },
        {
          $lookup: {
            from: boardModel.BOARD_COLLECTION_NAME,
            let: { wsId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$workspaceId', '$$wsId'] },
                  _destroy: false
                }
              },
              { $sort: { title: 1 } }
            ],
            as: 'boards'
          }
        },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: 'ownerIds',
            foreignField: '_id',
            as: 'owners',
            pipeline: [{ $project: { password: 0, verifyToken: 0 } }]
          }
        },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: 'memberIds',
            foreignField: '_id',
            as: 'members',
            pipeline: [{ $project: { password: 0, verifyToken: 0 } }]
          }
        }
      ])
      .toArray()

    return result[0] || null
  } catch (error) { throw new Error(error) }
}

const update = async (workspaceId, updateData) => {
  try {
    Object.keys(updateData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    const result = await GET_DB()
      .collection(WORKSPACE_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(workspaceId) },
        { $set: { ...updateData, updatedAt: Date.now() } },
        { returnDocument: 'after' }
      )
    return result
  } catch (error) { throw new Error(error) }
}

const deleteOneById = async (workspaceId) => {
  try {
    const result = await GET_DB()
      .collection(WORKSPACE_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(workspaceId) },
        { $set: { _destroy: true, updatedAt: Date.now() } },
        { returnDocument: 'after' }
      )
    return result
  } catch (error) { throw new Error(error) }
}

const pushMemberIds = async (workspaceId, userId) => {
  try {
    const result = await GET_DB()
      .collection(WORKSPACE_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(workspaceId) },
        { $push: { memberIds: new ObjectId(userId) } },
        { returnDocument: 'after' }
      )
    return result
  } catch (error) { throw new Error(error) }
}

export const workspaceModel = {
  WORKSPACE_COLLECTION_NAME,
  WORKSPACE_TYPES,
  WORKSPACE_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getWorkspacesByUserId,
  getDetails,
  update,
  deleteOneById,
  pushMemberIds
}
