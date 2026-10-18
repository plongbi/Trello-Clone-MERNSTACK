import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Tooltip from '@mui/material/Tooltip'
import Zoom from '@mui/material/Zoom'
import StarIcon from '@mui/icons-material/Star'
import GradeIcon from '@mui/icons-material/Grade'
import { fetchStarredBoardsAPI, toggleStarBoardAPI } from '~/apis'
import { useTheme } from '@mui/material/styles'

const BOARD_COLORS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
]

function getBoardGradient(boardId) {
  const hash = boardId ? boardId.charCodeAt(0) + boardId.charCodeAt(boardId.length - 1) : 0
  return BOARD_COLORS[hash % BOARD_COLORS.length]
}

function StarredPage() {
  const navigate = useNavigate()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const [boards, setBoards] = useState([])
  const [loading, setLoading] = useState(true)
  const [removingIds, setRemovingIds] = useState(new Set())

  useEffect(() => {
    const loadStarred = async () => {
      try {
        const data = await fetchStarredBoardsAPI()
        setBoards(data || [])
      } catch {
        setBoards([])
      } finally {
        setLoading(false)
      }
    }
    loadStarred()
  }, [])

  const handleUnstar = async (e, boardId) => {
    e.stopPropagation()
    // Optimistic: đánh dấu đang xóa để animate
    setRemovingIds(prev => new Set(prev).add(boardId))
    try {
      await toggleStarBoardAPI(boardId)
      // Xóa khỏi danh sách sau animation
      setTimeout(() => {
        setBoards(prev => prev.filter(b => b._id?.toString() !== boardId))
        setRemovingIds(prev => {
          const next = new Set(prev)
          next.delete(boardId)
          return next
        })
      }, 300)
    } catch {
      setRemovingIds(prev => {
        const next = new Set(prev)
        next.delete(boardId)
        return next
      })
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', px: 4, py: 5 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
        <Box sx={{
          width: 40, height: 40, borderRadius: 2,
          background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <StarIcon sx={{ color: 'white', fontSize: 20 }} />
        </Box>
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 700 }}>Đã Đánh Dấu Sao</Typography>
          <Typography variant='body2' sx={{ opacity: 0.5 }}>
            {boards.length} board được đánh dấu sao · Click ⭐ để bỏ đánh dấu
          </Typography>
        </Box>
      </Box>

      {boards.length === 0 ? (
        <Box sx={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '40vh', gap: 2, opacity: 0.4
        }}>
          <GradeIcon sx={{ fontSize: 72 }} />
          <Typography variant='h6'>Bạn chưa đánh dấu sao board nào</Typography>
          <Typography variant='body2'>Click vào ⭐ trên bất kỳ board nào để thêm vào đây</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 2 }}>
          {boards.map((board) => {
            const boardId = board._id?.toString()
            const isRemoving = removingIds.has(boardId)
            const gradient = getBoardGradient(boardId)

            return (
              <Zoom key={board._id} in={!isRemoving} timeout={300}>
                <Card
                  sx={{
                    position: 'relative', overflow: 'hidden', borderRadius: 3,
                    opacity: isRemoving ? 0 : 1,
                    transform: isRemoving ? 'scale(0.9)' : 'scale(1)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': { transform: 'translateY(-3px)', boxShadow: 8 }
                  }}
                >
                  <CardActionArea onClick={() => navigate(`/boards/${board._id}`)}>
                    {/* Background */}
                    <Box sx={{
                      height: 120,
                      background: board.cover ? `url(${board.cover}) center/cover` : gradient
                    }} />
                    <Box sx={{
                      position: 'absolute', top: 0, left: 0, right: 0, height: 120,
                      background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.55) 100%)'
                    }} />

                    <CardContent sx={{ pt: 1.5 }}>
                      <Typography variant='body1' sx={{ fontWeight: 700, mb: 0.5 }}>
                        {board.title}
                      </Typography>
                      <Typography variant='caption' sx={{ opacity: 0.5 }}>
                        {board.type === 'private' ? '🔒 Riêng tư' : '🌐 Công khai'}
                      </Typography>
                    </CardContent>
                  </CardActionArea>

                  {/* Star icon - click để bỏ star */}
                  <Tooltip title='Bỏ đánh dấu sao' placement='top'>
                    <Box
                      onClick={(e) => handleUnstar(e, boardId)}
                      sx={{
                        position: 'absolute', top: 8, right: 8, width: 32, height: 32,
                        borderRadius: '50%', bgcolor: 'rgba(0,0,0,0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'rgba(255,140,0,0.8)',
                          transform: 'scale(1.2) rotate(-15deg)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <StarIcon sx={{ fontSize: 16, color: '#FFD700' }} />
                    </Box>
                  </Tooltip>
                </Card>
              </Zoom>
            )
          })}
        </Box>
      )}
    </Box>
  )
}

export default StarredPage
