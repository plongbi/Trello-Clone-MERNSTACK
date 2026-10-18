export const FIELD_REQUIRED_MESSAGE = 'This field is required.'
export const EMAIL_RULE = /^\S+@\S+\.\S+$/
export const EMAIL_RULE_MESSAGE = 'Email is invalid. (example@gmail.com)'
export const PASSWORD_RULE = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d\W]{8,256}$/
export const PASSWORD_RULE_MESSAGE = 'Password must include at least 1 letter, a number, and at least 8 characters.'
export const PASSWORD_CONFIRMATION_MESSAGE = 'Password Confirmation does not match!'


// Liên quan đến Validate File (Cover Image)
export const LIMIT_COMMON_FILE_SIZE = 10485760 // byte = 10 MB
export const ALLOW_COMMON_FILE_TYPES = ['image/jpg', 'image/jpeg', 'image/png']
export const singleFileValidator = (file) => {
  if (!file || !file.name || !file.size || !file.type) {
    return 'File cannot be blank.'
  }
  if (file.size > LIMIT_COMMON_FILE_SIZE) {
    return 'Maximum file size exceeded. (10MB)'
  }
  if (!ALLOW_COMMON_FILE_TYPES.includes(file.type)) {
    return 'File type is invalid. Only accept jpg, jpeg and png'
  }
  return null
}

// Liên quan đến Validate File (Attachment) - hỗ trợ nhiều loại file
export const LIMIT_ATTACHMENT_FILE_SIZE = 25 * 1024 * 1024 // 25 MB
export const ALLOW_ATTACHMENT_FILE_TYPES = [
  // Images
  'image/jpg', 'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // Archives
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  // Text
  'text/plain', 'text/csv'
]

export const attachmentFilesValidator = (files) => {
  if (!files || files.length === 0) {
    return 'Please select at least one file.'
  }
  for (const file of files) {
    if (file.size > LIMIT_ATTACHMENT_FILE_SIZE) {
      return `File "${file.name}" exceeds the maximum size of 25MB.`
    }
    if (!ALLOW_ATTACHMENT_FILE_TYPES.includes(file.type)) {
      return `File type "${file.type}" is not supported.`
    }
  }
  return null
}
