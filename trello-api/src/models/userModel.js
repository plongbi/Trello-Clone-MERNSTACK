import Joi from 'joi'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE } from '~/utils/validators'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'

const USER_ROLES ={
  CLIENT: 'client',
  ADMIN: 'admin'
}

// Define Collection (name & schema)
const USER_COLLECTION_NAME = 'users'
const USER_COLLECTION_SCHEMA = Joi.object({
  email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE), //unique
  password: Joi.string().required(),
  // username cắt ra từ email sẽ có khả năng ko unique vì có những tên email trùng nhau nhưng từ
  // các nhà cung cấp khác nhau
  username: Joi.string().required().trim().strict(),
  displayName: Joi.string().required().trim().strict(),
  avatar: Joi.string().default(null),
  role: Joi.string().valid(USER_ROLES.CLIENT, USER_ROLES.ADMIN).default(USER_ROLES.CLIENT),

  isActive: Joi.boolean().default(false),
  verifyToken: Joi.string(),

  // Danh sách boardId đã đánh dấu sao (max 50)
  starredBoards: Joi.array().items(
    Joi.string()
  ).max(50).default([]),

  // Danh sách lịch sử truy cập board gần đây (max 20)
  recentBoards: Joi.array().items(
    Joi.object({
      boardId: Joi.string(),
      accessedAt: Joi.date().timestamp('javascript').default(Date.now)
    })
  ).max(20).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

// Chỉ định ra những fields mà chúng ta ko muốn cho phép update trong hafmupdate()
const INVALID_UPDATE_FIELDS = ['_id', 'createdAt', 'email', 'username']

const validateBeforeCreate = async (data) => {
  return await USER_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const createdUser = await GET_DB().collection(USER_COLLECTION_NAME).insertOne(validData)
    return createdUser
  } catch (error) { throw new Error(error) }
}

const findOneById = async (userId) => {
  try {
    const result = await GET_DB().collection(USER_COLLECTION_NAME).findOne({ _id: new ObjectId(userId) })
    return result
  } catch (error) { throw new Error(error) }
}

const findOneByEmail = async (emailValue) => {
  try {
    const result = await GET_DB().collection(USER_COLLECTION_NAME).findOne({ email: emailValue })
    return result
  } catch (error) { throw new Error(error) }
}

const update = async (userId, updateData) => {
  try {
    // Lọc những fields không cho phép update linh tinh
    Object.keys(updateData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    const result = await GET_DB().collection(USER_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: updateData },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

// Toggle star/unstar một board cho user
const toggleStarBoard = async (userId, boardId) => {
  try {
    const user = await findOneById(userId)
    if (!user) throw new Error('User not found')

    const starredBoards = user.starredBoards || []
    const isStarred = starredBoards.includes(boardId)

    let result
    if (isStarred) {
      result = await GET_DB().collection(USER_COLLECTION_NAME).findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $pull: { starredBoards: boardId }, $set: { updatedAt: Date.now() } },
        { returnDocument: 'after' }
      )
    } else {
      result = await GET_DB().collection(USER_COLLECTION_NAME).findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $push: { starredBoards: boardId }, $set: { updatedAt: Date.now() } },
        { returnDocument: 'after' }
      )
    }
    return { isStarred: !isStarred, user: result }
  } catch (error) { throw new Error(error) }
}

// Cập nhật lịch sử truy cập board gần đây
const trackRecentBoard = async (userId, boardId) => {
  try {
    // Xóa boardId cũ nếu đã tồn tại (tránh trùng lặp)
    await GET_DB().collection(USER_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $pull: { recentBoards: { boardId: boardId } } }
    )
    // Push vào đầu mảng
    await GET_DB().collection(USER_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(userId) },
      {
        $push: {
          recentBoards: {
            $each: [{ boardId: boardId, accessedAt: Date.now() }],
            $position: 0,
            $slice: 20
          }
        },
        $set: { updatedAt: Date.now() }
      }
    )
  } catch (error) { throw new Error(error) }
}

// Lấy starred boards của user (kèm populate board info)
const getStarredBoards = async (userId) => {
  try {
    const result = await GET_DB().collection(USER_COLLECTION_NAME).aggregate([
      { $match: { _id: new ObjectId(userId) } },
      {
        $lookup: {
          from: 'boards',
          let: { starredIds: { $map: { input: { $ifNull: ['$starredBoards', []] }, as: 'id', in: { $toObjectId: '$$id' } } } },
          pipeline: [
            { $match: { $expr: { $in: ['$_id', '$$starredIds'] }, _destroy: false } }
          ],
          as: 'starredBoardsData'
        }
      },
      { $project: { starredBoardsData: 1, starredBoards: 1 } }
    ]).toArray()
    return result[0]?.starredBoardsData || []
  } catch (error) { throw new Error(error) }
}

// Lấy recent boards của user (kèm populate board info)
const getRecentBoards = async (userId, limit = 10) => {
  try {
    const user = await findOneById(userId)
    if (!user) return []

    const recentBoards = (user.recentBoards || []).slice(0, limit)
    if (recentBoards.length === 0) return []

    const boardIds = recentBoards.map(rb => new ObjectId(rb.boardId))
    const boards = await GET_DB().collection('boards').find({
      _id: { $in: boardIds },
      _destroy: false
    }).toArray()

    const boardMap = {}
    boards.forEach(b => { boardMap[b._id.toString()] = b })

    const result = recentBoards
      .filter(rb => boardMap[rb.boardId])
      .map(rb => ({
        ...boardMap[rb.boardId],
        accessedAt: rb.accessedAt
      }))

    return result
  } catch (error) { throw new Error(error) }
}

export const userModel = {
  USER_COLLECTION_NAME,
  USER_COLLECTION_SCHEMA,
  USER_ROLES,
  createNew,
  findOneById,
  findOneByEmail,
  update,
  toggleStarBoard,
  trackRecentBoard,
  getStarredBoards,
  getRecentBoards
}