import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Tooltip from '@mui/material/Tooltip'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import HistoryIcon from '@mui/icons-material/History'
import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import { fetchRecentBoardsAPI, toggleStarBoardAPI, fetchStarredBoardsAPI } from '~/apis'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

const BOARD_COLORS = [
  '#667eea', '#f093fb', '#4facfe', '#43e97b',
  '#fa709a', '#30cfd0', '#a18cd1', '#ffecd2'
]
function getBoardColor(boardId) {
  const hash = boardId ? boardId.charCodeAt(0) + boardId.charCodeAt(boardId.length - 1) : 0
  return BOARD_COLORS[hash % BOARD_COLORS.length]
}

function Recent() {
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState(null)
  const [boards, setBoards] = useState([])
  const [loading, setLoading] = useState(false)
  const [starredIds, setStarredIds] = useState(new Set())
  const open = Boolean(anchorEl)

  const handleClick = async (event) => {
    setAnchorEl(event.currentTarget)
    if (boards.length === 0) {
      setLoading(true)
      try {
        const [recentData, starredData] = await Promise.all([
          fetchRecentBoardsAPI(),
          fetchStarredBoardsAPI()
        ])
        setBoards(recentData || [])
        setStarredIds(new Set((starredData || []).map(b => b._id?.toString())))
      } finally {
        setLoading(false)
      }
    }
  }
  const handleClose = () => setAnchorEl(null)

  const handleToggleStar = async (e, boardId) => {
    e.stopPropagation()
    try {
      await toggleStarBoardAPI(boardId)
      setStarredIds(prev => {
        const next = new Set(prev)
        next.has(boardId) ? next.delete(boardId) : next.add(boardId)
        return next
      })
    } catch { /* silent */ }
  }

  return (
    <Box>
      <Button
        sx={{ color: 'white' }}
        id='basic-button-recent'
        aria-controls={open ? 'menu-recent' : undefined}
        aria-haspopup='true'
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        endIcon={<ExpandMoreIcon />}
      >
        Recent
      </Button>

      <Menu
        id='menu-recent'
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 8,
          sx: { borderRadius: 3, minWidth: 280, mt: 0.5, border: '1px solid', borderColor: 'divider' }
        }}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
          <Typography variant='caption' sx={{ fontWeight: 700, opacity: 0.5, textTransform: 'uppercase', letterSpacing: 1 }}>
            Gần Đây
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : boards.length === 0 ? (
          <Box sx={{ px: 2, py: 2, textAlign: 'center', opacity: 0.5 }}>
            <HistoryIcon sx={{ mb: 1 }} />
            <Typography variant='body2'>Chưa có board nào gần đây</Typography>
          </Box>
        ) : (
          boards.slice(0, 5).map(board => {
            const boardId = board._id?.toString()
            const isStarred = starredIds.has(boardId)
            return (
              <MenuItem
                key={board._id}
                onClick={() => { handleClose(); navigate(`/boards/${board._id}`) }}
                sx={{ py: 1, px: 2, borderRadius: 2, mx: 1, my: 0.25 }}
              >
                <Box sx={{
                  width: 28, height: 28, borderRadius: 1.5, mr: 1.5, flexShrink: 0,
                  bgcolor: getBoardColor(boardId)
                }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant='body2' sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {board.title}
                  </Typography>
                  {board.accessedAt && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                      <AccessTimeIcon sx={{ fontSize: 10, opacity: 0.4 }} />
                      <Typography variant='caption' sx={{ opacity: 0.4 }}>
                        {formatDistanceToNow(new Date(board.accessedAt), { addSuffix: true, locale: vi })}
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Tooltip title={isStarred ? 'Bỏ sao' : 'Đánh dấu sao'}>
                  <Box onClick={(e) => handleToggleStar(e, boardId)} sx={{ ml: 0.5, p: 0.25, borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}>
                    {isStarred
                      ? <StarIcon sx={{ fontSize: 16, color: '#FFD700' }} />
                      : <StarBorderIcon sx={{ fontSize: 16, opacity: 0.4 }} />
                    }
                  </Box>
                </Tooltip>
              </MenuItem>
            )
          })
        )}

        <Divider sx={{ my: 1 }} />
        <MenuItem
          onClick={() => { handleClose(); navigate('/recent') }}
          sx={{ py: 1, px: 2, borderRadius: 2, mx: 1, my: 0.25 }}
        >
          <HistoryIcon sx={{ fontSize: 18, mr: 1.5, opacity: 0.6 }} />
          <Typography variant='body2' sx={{ fontWeight: 600 }}>Xem tất cả gần đây</Typography>
        </MenuItem>
        <Box sx={{ height: 4 }} />
      </Menu>
    </Box>
  )
}

export default Recent