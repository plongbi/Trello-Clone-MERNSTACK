import express from 'express'
import { cardValidation } from '~/validations/cardValidation'
import { cardController } from '~/controllers/cardController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { multerUploadMiddleware } from '~/middlewares/multerUploadMiddleware'

const Router = express.Router()

Router.route('/')
  .post(authMiddleware.isAuthorized, cardValidation.createNew, cardController.createNew)

Router.route('/:id')
  .put(
    authMiddleware.isAuthorized,
    // Hỗ trợ cả cardCover (1 file) và attachments (nhiều file)
    (req, res, next) => {
      // Kiểm tra xem request có phải upload attachment không
      const contentType = req.headers['content-type'] || ''
      if (contentType.includes('multipart/form-data')) {
        // Dùng uploadAttachments.fields để handle cả hai loại
        multerUploadMiddleware.uploadAttachments.fields([
          { name: 'cardCover', maxCount: 1 },
          { name: 'attachments', maxCount: 10 }
        ])(req, res, (err) => {
          if (err) return next(err)
          // Chuẩn hóa req.file và req.files
          if (req.files) {
            if (req.files['cardCover']) {
              req.file = req.files['cardCover'][0]
              req.files = req.files['attachments'] || []
            } else if (req.files['attachments']) {
              req.files = req.files['attachments']
            } else {
              req.files = []
            }
          } else {
            req.files = []
          }
          next()
        })
      } else {
        next()
      }
    },
    cardValidation.update,
    cardController.update
  )
  .delete(
    authMiddleware.isAuthorized,
    cardValidation.deleteItem,
    cardController.deleteItem
  )

export const cardRoute = Router