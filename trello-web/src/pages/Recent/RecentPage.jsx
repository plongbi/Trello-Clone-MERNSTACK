import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import HistoryIcon from '@mui/icons-material/History'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import { fetchRecentBoardsAPI, toggleStarBoardAPI, fetchStarredBoardsAPI } from '~/apis'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { useTheme } from '@mui/material/styles'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

// Palette màu cho boards không có cover
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

function RecentPage() {
  const navigate = useNavigate()
  const currentUser = useSelector(selectCurrentUser)
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const [boards, setBoards] = useState([])
  const [loading, setLoading] = useState(true)
  const [starredIds, setStarredIds] = useState(new Set())
  const [togglingId, setTogglingId] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [recentData, starredData] = await Promise.all([
          fetchRecentBoardsAPI(),
          fetchStarredBoardsAPI()
        ])
        setBoards(recentData || [])
        setStarredIds(new Set((starredData || []).map(b => b._id?.toString())))
      } catch {
        setBoards([])
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleToggleStar = async (e, boardId) => {
    e.stopPropagation()
    setTogglingId(boardId)
    try {
      await toggleStarBoardAPI(boardId)
      setStarredIds(prev => {
        const next = new Set(prev)
        next.has(boardId) ? next.delete(boardId) : next.add(boardId)
        return next
      })
    } finally {
      setTogglingId(null)
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
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <HistoryIcon sx={{ color: 'white', fontSize: 20 }} />
        </Box>
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 700 }}>Gần Đây</Typography>
          <Typography variant='body2' sx={{ opacity: 0.5 }}>
            {boards.length} board bạn đã truy cập gần đây
          </Typography>
        </Box>
      </Box>

      {boards.length === 0 ? (
        <Box sx={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '40vh', gap: 2, opacity: 0.4
        }}>
          <HistoryIcon sx={{ fontSize: 72 }} />
          <Typography variant='h6'>Bạn chưa truy cập board nào gần đây</Typography>
          <Typography variant='body2'>Hãy mở một board để bắt đầu</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 2 }}>
          {boards.map((board) => {
            const isStarred = starredIds.has(board._id?.toString())
            const isToggling = togglingId === board._id?.toString()
            const gradient = getBoardGradient(board._id?.toString())

            return (
              <Card
                key={board._id}
                sx={{
                  position: 'relative', overflow: 'hidden',
                  borderRadius: 3,
                  '&:hover': { transform: 'translateY(-3px)', boxShadow: 8 },
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <CardActionArea onClick={() => navigate(`/boards/${board._id}`)}>
                  {/* Card background */}
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
                    {board.accessedAt && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTimeIcon sx={{ fontSize: 12, opacity: 0.4 }} />
                        <Typography variant='caption' sx={{ opacity: 0.5 }}>
                          {formatDistanceToNow(new Date(board.accessedAt), { addSuffix: true, locale: vi })}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </CardActionArea>

                {/* Star toggle button */}
                <Tooltip title={isStarred ? 'Bỏ đánh dấu sao' : 'Đánh dấu sao'}>
                  <Box
                    onClick={(e) => handleToggleStar(e, board._id?.toString())}
                    sx={{
                      position: 'absolute', top: 8, right: 8, width: 32, height: 32,
                      borderRadius: '50%', bgcolor: 'rgba(0,0,0,0.4)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.65)', transform: 'scale(1.1)' },
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {isStarred
                      ? <StarIcon sx={{ fontSize: 16, color: '#FFD700' }} />
                      : <StarBorderIcon sx={{ fontSize: 16, color: 'white' }} />
                    }
                  </Box>
                </Tooltip>
              </Card>
            )
          })}
        </Box>
      )}
    </Box>
  )
}

export default RecentPage
