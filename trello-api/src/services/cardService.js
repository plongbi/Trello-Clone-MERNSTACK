/* eslint-disable no-console */
import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/coulmnModel'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import cloudinary from 'cloudinary'
import { notificationModel } from '~/models/notificationModel'

const createNew = async (userId, reqBody) => {
  try {
    const newCard = {
      ...reqBody
    }
    const createdCard = await cardModel.createNew(userId, newCard)
    const getNewCard = await cardModel.findOneById(createdCard.insertedId)

    if (getNewCard) {
      // Update cardOrderIds trong collection column
      await columnModel.pushCardOrderIds(getNewCard)
    }

    return getNewCard
  } catch (error) { throw error }
}

const update = async (cardId, reqBody, cardCoverFile, attachmentFiles, userInfo) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }

    let updatedCard = {}

    if (cardCoverFile) {
      const uploadResult = await CloudinaryProvider.streamUpload(cardCoverFile.buffer, 'card-covers')
      updatedCard = await cardModel.update(cardId, { cover: uploadResult.secure_url })
    }

    else if (attachmentFiles && attachmentFiles.length > 0) {
      // Upload tất cả file attachment lên Cloudinary
      const uploadedAttachments = []
      for (const file of attachmentFiles) {
        const uploadResult = await CloudinaryProvider.streamUploadAttachment(
          file.buffer,
          'card-attachments',
          file.originalname
        )
        uploadedAttachments.push({
          fileName: file.originalname,
          fileUrl: uploadResult.secure_url,
          fileType: file.mimetype,
          fileSize: file.size,
          publicId: uploadResult.public_id,
          resourceType: uploadResult.resource_type,
          uploadedAt: Date.now(),
          uploadedBy: userInfo._id
        })
      }
      // Push từng attachment vào DB
      let lastCard = null
      for (const attachment of uploadedAttachments) {
        lastCard = await cardModel.pushAttachment(cardId, attachment)
      }
      updatedCard = lastCard
    }

    else if (updateData.removeAttachmentPublicId) {
      // Xóa attachment khỏi Cloudinary
      const publicId = updateData.removeAttachmentPublicId
      // Cần tìm resource type để xóa đúng
      const card = await cardModel.findOneById(cardId)
      const attachment = card?.attachments?.find(a => a.publicId === publicId)
      if (attachment) {
        try {
          await cloudinary.v2.uploader.destroy(publicId, { resource_type: attachment.resourceType || 'raw' })
        } catch (e) {
          // Nếu xóa cloudinary thất bại vẫn tiếp tục xóa trong DB
        }
      }
      updatedCard = await cardModel.removeAttachment(cardId, publicId)
    }

    else if (updateData.commentToAdd) {
      // Tạo data comment để add vào DB, cần bổ sung những field cần thiết
      const commentData = {
        ...updateData.commentToAdd,
        commentedAt: Date.now(),
        userId: userInfo._id,
        userEmail: userInfo.email
      }

      updatedCard = await cardModel.unshiftNewComment(cardId, commentData)

      // --- TRIGGER REALTIME NOTIFICATION ---
      try {
        const potentialRecipients = new Set([
          ...(updatedCard.ownerIds || []).map(id => id.toString()),
          ...(updatedCard.memberIds || []).map(id => id.toString()),
          ...(updatedCard.comments || []).map(c => c.userId.toString())
        ])

        potentialRecipients.delete(userInfo._id.toString())
        const recipientIds = Array.from(potentialRecipients)

        for (const recipientId of recipientIds) {
          const notificationPayload = {
            senderId: userInfo._id.toString(),
            recipientId: recipientId,
            type: 'CARD_COMMENTED',
            boardId: updatedCard.boardId.toString(),
            cardId: updatedCard._id.toString(),
            title: 'Bình luận mới',
            message: `${userInfo.displayName} đã bình luận vào thẻ "${updatedCard.title}"`
          }

          const createdNotification = await notificationModel.createNew(notificationPayload)
          const savedNotification = await notificationModel.findOneById(createdNotification.insertedId)

          if (global.io) {
            global.io.to(`user_${recipientId}`).emit('BE_NEW_NOTIFICATION', {
              ...savedNotification,
              sender: {
                _id: userInfo._id,
                email: userInfo.email,
                displayName: userInfo.displayName,
                avatar: userInfo.avatar
              }
            })
          }
        }
      } catch (err) {
        console.error('Failed to trigger comment notification:', err)
      }
    }

    else if (updateData.commentToUpdate) {
      updatedCard = await cardModel.updateComment(cardId, {
        userId: userInfo._id,
        commentedAt: updateData.commentToUpdate.commentedAt,
        content: updateData.commentToUpdate.content
      })
    }

    else if (updateData.commentToDelete) {
      updatedCard = await cardModel.deleteComment(cardId, {
        userId: userInfo._id,
        commentedAt: updateData.commentToDelete.commentedAt
      })
    }

    else if (updateData.incomingMemberInfo) {
      // TH ADD hoặc REMOVE member ra khỏi card
      updatedCard = await cardModel.updateMembers(cardId, updateData.incomingMemberInfo)

      // --- TRIGGER REALTIME NOTIFICATION (Chỉ khi ADD member) ---
      if (updateData.incomingMemberInfo.action === 'ADD') {
        try {
          const targetUserId = updateData.incomingMemberInfo.userId
          if (targetUserId.toString() !== userInfo._id.toString()) {
            const notificationPayload = {
              senderId: userInfo._id.toString(),
              recipientId: targetUserId.toString(),
              type: 'CARD_MEMBER_ADDED',
              boardId: updatedCard.boardId.toString(),
              cardId: updatedCard._id.toString(),
              title: 'Thêm vào thẻ',
              message: `${userInfo.displayName} đã thêm bạn vào thẻ "${updatedCard.title}"`
            }

            const createdNotification = await notificationModel.createNew(notificationPayload)
            const savedNotification = await notificationModel.findOneById(createdNotification.insertedId)

            if (global.io) {
              global.io.to(`user_${targetUserId}`).emit('BE_NEW_NOTIFICATION', {
                ...savedNotification,
                sender: {
                  _id: userInfo._id,
                  email: userInfo.email,
                  displayName: userInfo.displayName,
                  avatar: userInfo.avatar
                }
              })
            }
          }
        } catch (err) {
          console.error('Failed to trigger member added notification:', err)
        }
      }
    }

    else {
      // Các TH update chung: title, des
      updatedCard = await cardModel.update(cardId, updateData)
    }
    return updatedCard
  } catch (error) { throw error }
}

const deleteItem = async (cardId) => {
  try {
    const targetCard = await cardModel.findOneById(cardId)
    if (!targetCard) throw new ApiError(StatusCodes.NOT_FOUND, 'Card not found!')

    // Xóa card
    await cardModel.deleteOneById(cardId)

    // Xoá cardId trong mảng cardOrderIds của column chứa nó
    await columnModel.pullCardOrderIds(targetCard)

    return { deleteResult: 'Card deleted successfully!' }
  } catch (error) { throw error }
}

export const cardService = {
  createNew,
  update,
  deleteItem
}