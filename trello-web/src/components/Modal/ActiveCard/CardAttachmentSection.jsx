import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import DownloadIcon from '@mui/icons-material/Download'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import FolderZipIcon from '@mui/icons-material/FolderZip'
import TableChartIcon from '@mui/icons-material/TableChart'
import DescriptionIcon from '@mui/icons-material/Description'
import SlideshowIcon from '@mui/icons-material/Slideshow'
import ImageIcon from '@mui/icons-material/Image'
import { useState } from 'react'

// Helper: format file size
const formatFileSize = (bytes) => {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Helper: format date
const formatDate = (timestamp) => {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

// Helper: get icon and color by file type
const getFileIcon = (fileType) => {
  if (!fileType) return { icon: <InsertDriveFileIcon />, color: '#607d8b' }
  if (fileType.startsWith('image/')) return { icon: <ImageIcon />, color: '#4caf50' }
  if (fileType === 'application/pdf') return { icon: <PictureAsPdfIcon />, color: '#f44336' }
  if (fileType.includes('word') || fileType.includes('msword')) return { icon: <DescriptionIcon />, color: '#2196f3' }
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return { icon: <TableChartIcon />, color: '#4caf50' }
  if (fileType.includes('powerpoint') || fileType.includes('presentation')) return { icon: <SlideshowIcon />, color: '#ff9800' }
  if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z')) return { icon: <FolderZipIcon />, color: '#9c27b0' }
  return { icon: <InsertDriveFileIcon />, color: '#607d8b' }
}

// Helper: kiểm tra có phải ảnh không
const isImageFile = (fileType) => fileType && fileType.startsWith('image/')

function CardAttachmentSection({ attachments = [], onUploadAttachments, onRemoveAttachment, isUploadingAttachment }) {
  const [deletingPublicId, setDeletingPublicId] = useState(null)

  const handleDelete = async (publicId) => {
    setDeletingPublicId(publicId)
    try {
      await onRemoveAttachment(publicId)
    } finally {
      setDeletingPublicId(null)
    }
  }

  if (!attachments || attachments.length === 0) return null

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <AttachFileOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
          Attachments ({attachments.length})
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {attachments.map((attachment, index) => {
          const { icon, color } = getFileIcon(attachment.fileType)
          const isImage = isImageFile(attachment.fileType)
          const isDeleting = deletingPublicId === attachment.publicId

          return (
            <Box
              key={attachment.publicId || index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1,
                borderRadius: '6px',
                border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? '#3a4a5c' : '#e0e0e0'}`,
                backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#1e2d3d' : '#f8f9fa',
                transition: 'background-color 0.15s',
                '&:hover': {
                  backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#243447' : '#f0f4ff'
                },
                opacity: isDeleting ? 0.5 : 1
              }}
            >
              {/* Thumbnail hoặc Icon */}
              {isImage ? (
                <Box
                  component="a"
                  href={attachment.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '4px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <img
                    src={attachment.fileUrl}
                    alt={attachment.fileName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                </Box>
              ) : (
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '4px',
                  backgroundColor: `${color}18`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: color
                }}>
                  {icon}
                </Box>
              )}

              {/* Info */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontSize: '13px'
                  }}
                  title={attachment.fileName}
                >
                  {attachment.fileName}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                  {attachment.fileSize && (
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(attachment.fileSize)}
                    </Typography>
                  )}
                  {attachment.uploadedAt && (
                    <Typography variant="caption" color="text.secondary">
                      · {formatDate(attachment.uploadedAt)}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Actions */}
              <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                <Tooltip title="Download / Open">
                  <IconButton
                    size="small"
                    component="a"
                    href={attachment.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={attachment.fileName}
                    sx={{ color: 'primary.main' }}
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(attachment.publicId)}
                    disabled={isDeleting}
                    sx={{ color: 'error.main' }}
                  >
                    {isDeleting ? <CircularProgress size={16} /> : <DeleteOutlineIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          )
        })}
      </Box>

      {isUploadingAttachment && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <CircularProgress size={14} />
          <Typography variant="caption" color="text.secondary">Uploading...</Typography>
        </Box>
      )}
    </Box>
  )
}

export default CardAttachmentSection
