import multer from 'multer'
import { LIMIT_COMMON_FILE_SIZE, ALLOW_COMMON_FILE_TYPES, ALLOW_ATTACHMENT_FILE_TYPES, LIMIT_ATTACHMENT_FILE_SIZE } from '~/utils/validators'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'


// Fuction ktra loại file nào đc chấp nhận (cho cover image)
const customFileFilter = (req, file, callback) => {
  // Đối với multer, ktra kiểu file thì dùng mimetype
  if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
    const errMessage = 'File type is invalid. Only accept jpg, jpeg and png'
    return callback(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errMessage), null)
  }

  // Nếu kiểu file hợp lệ
  return callback(null, true)
}

// Fuction ktra loại file nào đc chấp nhận cho attachment
const attachmentFileFilter = (req, file, callback) => {
  // Fix encoding cho tên file tiếng Việt/Unicode
  file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8')

  if (!ALLOW_ATTACHMENT_FILE_TYPES.includes(file.mimetype)) {
    const errMessage = 'Attachment type is invalid. Only accept images, PDF, Word, Excel, PowerPoint, ZIP, RAR files.'
    return callback(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errMessage), null)
  }
  return callback(null, true)
}

// Khởi tạo fuction upload đc bọc bởi multer (cho cover image)
const upload = multer({
  limits: { fileSize: LIMIT_COMMON_FILE_SIZE },
  fileFilter: customFileFilter
})

// Khởi tạo fuction upload cho attachments (nhiều file, nhiều loại)
const uploadAttachments = multer({
  limits: { fileSize: LIMIT_ATTACHMENT_FILE_SIZE },
  fileFilter: attachmentFileFilter
})

export const multerUploadMiddleware = { upload, uploadAttachments }