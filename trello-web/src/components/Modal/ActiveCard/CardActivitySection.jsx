import moment from 'moment'
import 'moment/locale/vi' // Import Vietnamese locale for moment
import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'

import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'

// Set moment language to Vietnamese
moment.locale('vi')

function CardActivitySection({ cardComments = [], onAddCardComment, onUpdateCardComment, onDeleteCardComment }) {
  const currentUser = useSelector(selectCurrentUser)
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editContent, setEditContent] = useState('')

  const handleAddCardComment = (event) => {
    // Bắt hành động người dùng nhấn phím Enter && không phải hành động Shift + Enter
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault() // Thêm dòng này để khi Enter không bị nhảy dòng
      if (!event.target?.value) return // Nếu không có giá trị gì thì return không làm gì cả

      // Tạo một biến commend data để gửi api
      const commentToAdd = {
        userAvatar: currentUser?.avatar,
        userDisplayName: currentUser?.displayName,
        content: event.target.value.trim()
      }
      // Gọi lên prop ở component cha
      if (onAddCardComment) {
        onAddCardComment(commentToAdd).then(() => {
          event.target.value = ''
        })
      }
    }
  }

  const handleStartEdit = (comment) => {
    setEditingCommentId(comment.commentedAt)
    setEditContent(comment.content)
  }

  const handleCancelEdit = () => {
    setEditingCommentId(null)
    setEditContent('')
  }

  const handleSaveEdit = (comment) => {
    if (!editContent.trim()) {
      // Nếu xóa hết nội dung thì coi như xóa comment
      handleDelete(comment)
      return
    }

    const commentToUpdate = {
      commentedAt: comment.commentedAt,
      content: editContent.trim()
    }

    if (onUpdateCardComment) {
      onUpdateCardComment(commentToUpdate).then(() => {
        setEditingCommentId(null)
        setEditContent('')
      })
    }
  }

  const handleKeyDownEdit = (event, comment) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSaveEdit(comment)
    } else if (event.key === 'Escape') {
      handleCancelEdit()
    }
  }

  const handleDelete = (comment) => {
    const commentToDelete = {
      commentedAt: comment.commentedAt
    }
    if (onDeleteCardComment) {
      onDeleteCardComment(commentToDelete)
    }
  }

  return (
    <Box sx={{ mt: 2 }}>
      {/* Xử lý thêm comment vào Card */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Avatar
          sx={{ width: 36, height: 36, cursor: 'pointer' }}
          alt={currentUser?.displayName}
          src={currentUser?.avatar}
        />
        <TextField
          fullWidth
          placeholder="Viết bình luận..."
          type="text"
          variant="outlined"
          multiline
          onKeyDown={handleAddCardComment}
        />
      </Box>

      {/* Hiển thị danh sách các comments */}
      {cardComments.length === 0 &&
        <Typography sx={{ pl: '45px', fontSize: '14px', fontWeight: '500', color: '#b1b1b1' }}>Chưa có hoạt động nào!</Typography>
      }
      {cardComments.map((comment, index) =>
        <Box sx={{ display: 'flex', gap: 1, width: '100%', mb: 1.5 }} key={index}>
          <Tooltip title={comment.userDisplayName}>
            <Avatar
              sx={{ width: 36, height: 36, cursor: 'pointer' }}
              alt={comment.userDisplayName}
              src={comment.userAvatar}
            />
          </Tooltip>
          <Box sx={{ width: 'inherit' }}>
            <Typography variant="span" sx={{ fontWeight: 'bold', mr: 1 }}>
              {comment.userDisplayName}
            </Typography>

            <Typography variant="span" sx={{ fontSize: '12px', color: 'text.secondary' }}>
              {comment.updatedAt ? (
                <Typography variant="span" sx={{ fontStyle: 'italic' }}>
                  edited at {moment(comment.updatedAt).format('llll')}
                </Typography>
              ) : (
                moment(comment.commentedAt).format('llll')
              )}
            </Typography>

            {editingCommentId === comment.commentedAt ? (
              <Box sx={{ mt: 1 }}>
                <TextField
                  fullWidth
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={(e) => handleKeyDownEdit(e, comment)}
                  multiline
                  autoFocus
                  variant="outlined"
                  size="small"
                />
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Button variant="contained" size="small" onClick={() => handleSaveEdit(comment)}>
                    Lưu
                  </Button>
                  <Button variant="text" size="small" onClick={handleCancelEdit}>
                    Hủy
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box>
                <Box sx={{
                  display: 'inline-block',
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? '#33485D' : 'white',
                  p: '8px 12px',
                  mt: '4px',
                  border: '0.5px solid rgba(0, 0, 0, 0.2)',
                  borderRadius: '4px',
                  wordBreak: 'break-word',
                  boxShadow: '0 0 1px rgba(0, 0, 0, 0.2)'
                }}>
                  {comment.content}
                </Box>

                {currentUser?._id === comment.userId && (
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                    <Typography
                      variant="caption"
                      sx={{ cursor: 'pointer', color: 'text.secondary', '&:hover': { textDecoration: 'underline' } }}
                      onClick={() => handleStartEdit(comment)}
                    >
                      Edit
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default CardActivitySection
