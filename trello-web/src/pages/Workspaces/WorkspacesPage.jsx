import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Avatar from '@mui/material/Avatar'
import Tooltip from '@mui/material/Tooltip'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import AddIcon from '@mui/icons-material/Add'
import DashboardIcon from '@mui/icons-material/Dashboard'
import WorkspacesIcon from '@mui/icons-material/Workspaces'
import PeopleIcon from '@mui/icons-material/People'
import SettingsIcon from '@mui/icons-material/Settings'
import LockIcon from '@mui/icons-material/Lock'
import PublicIcon from '@mui/icons-material/Public'
import { useSelector, useDispatch } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'
import {
  fetchWorkspacesThunk,
  selectWorkspaces,
  selectWorkspaceLoading,
  setActiveWorkspace
} from '~/redux/workspace/workspaceSlice'
import {
  fetchWorkspacesAPI,
  getWorkspaceDetailsAPI,
  createNewBoardAPI
} from '~/apis'
import { useTheme } from '@mui/material/styles'
import CreateWorkspaceModal from '~/components/AppBar/CreateMenu/CreateWorkspaceModal'
import CreateBoardModal from '~/components/AppBar/CreateMenu/CreateBoardModal'

function WorkspacesPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const currentUser = useSelector(selectCurrentUser)
  const workspaces = useSelector(selectWorkspaces)
  const loading = useSelector(selectWorkspaceLoading)
  const theme = useTheme()

  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedWorkspace, setSelectedWorkspace] = useState(null)
  const [wsDetails, setWsDetails] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [openCreateWs, setOpenCreateWs] = useState(false)
  const [openCreateBoard, setOpenCreateBoard] = useState(false)

  const isDark = theme.palette.mode === 'dark'
  const selectedId = searchParams.get('id')

  // Fetch workspaces list
  useEffect(() => {
    dispatch(fetchWorkspacesThunk())
  }, [dispatch])

  // Select workspace khi có id trong URL hoặc chọn cái đầu tiên
  useEffect(() => {
    if (workspaces.length > 0) {
      const targetId = selectedId || workspaces[0]._id
      const ws = workspaces.find(w => w._id === targetId) || workspaces[0]
      setSelectedWorkspace(ws)
      if (!selectedId) setSearchParams({ id: ws._id })
    }
  }, [workspaces, selectedId])

  // Fetch chi tiết workspace khi chọn
  useEffect(() => {
    if (!selectedWorkspace) return
    const loadDetails = async () => {
      setDetailLoading(true)
      try {
        const data = await getWorkspaceDetailsAPI(selectedWorkspace._id)
        setWsDetails(data)
      } catch {
        setWsDetails(null)
      } finally {
        setDetailLoading(false)
      }
    }
    loadDetails()
  }, [selectedWorkspace])

  const handleSelectWorkspace = (ws) => {
    setSelectedWorkspace(ws)
    setSearchParams({ id: ws._id })
  }

  const handleWorkspaceCreated = (newWs) => {
    dispatch(fetchWorkspacesThunk())
    setOpenCreateWs(false)
  }

  const handleBoardCreated = (newBoard) => {
    navigate(`/boards/${newBoard._id}`)
  }

  const sidebarBg = isDark ? '#1a2332' : '#f4f5f7'
  const mainBg = isDark ? '#0f1724' : '#ffffff'
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'

  if (loading && workspaces.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 58px)', bgcolor: mainBg }}>
      {/* SIDEBAR */}
      <Box sx={{
        width: 280,
        minWidth: 280,
        bgcolor: sidebarBg,
        borderRight: `1px solid ${borderColor}`,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto'
      }}>
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant='body2' sx={{ fontWeight: 700, opacity: 0.6, textTransform: 'uppercase', letterSpacing: 1 }}>
              Workspaces
            </Typography>
            <Tooltip title='Tạo Workspace mới'>
              <Box
                onClick={() => setOpenCreateWs(true)}
                sx={{
                  width: 24, height: 24, borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                <AddIcon fontSize='small' sx={{ opacity: 0.7 }} />
              </Box>
            </Tooltip>
          </Box>

          {workspaces.length === 0 ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant='body2' sx={{ opacity: 0.5, mb: 2 }}>
                Bạn chưa có workspace nào
              </Typography>
              <Button
                variant='contained' size='small' startIcon={<AddIcon />}
                onClick={() => setOpenCreateWs(true)}
                sx={{ borderRadius: 2 }}
              >
                Tạo mới
              </Button>
            </Box>
          ) : (
            workspaces.map(ws => (
              <Box
                key={ws._id}
                onClick={() => handleSelectWorkspace(ws)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5,
                  borderRadius: 2, cursor: 'pointer', mb: 0.5,
                  bgcolor: selectedWorkspace?._id === ws._id
                    ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,82,204,0.08)')
                    : 'transparent',
                  border: selectedWorkspace?._id === ws._id
                    ? `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,82,204,0.2)'}`
                    : '1px solid transparent',
                  '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)' },
                  transition: 'all 0.15s ease'
                }}
              >
                <Avatar
                  sx={{
                    width: 32, height: 32, borderRadius: 1.5, fontSize: '1rem',
                    bgcolor: ws.color || '#0052CC', fontWeight: 700
                  }}
                >
                  {ws.logo || ws.title?.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant='body2' sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ws.title}
                  </Typography>
                  <Typography variant='caption' sx={{ opacity: 0.5 }}>
                    {ws.ownerIds?.length + (ws.memberIds?.length || 0)} thành viên
                  </Typography>
                </Box>
                {ws.type === 'private' ? <LockIcon sx={{ fontSize: 14, opacity: 0.4 }} /> : <PublicIcon sx={{ fontSize: 14, opacity: 0.4 }} />}
              </Box>
            ))
          )}
        </Box>
      </Box>

      {/* MAIN CONTENT */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {!selectedWorkspace ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 2 }}>
            <WorkspacesIcon sx={{ fontSize: 64, opacity: 0.2 }} />
            <Typography variant='h6' sx={{ opacity: 0.5 }}>Chọn hoặc tạo một Workspace để bắt đầu</Typography>
            <Button variant='contained' startIcon={<AddIcon />} onClick={() => setOpenCreateWs(true)} sx={{ borderRadius: 2 }}>
              Tạo Workspace
            </Button>
          </Box>
        ) : (
          <Box sx={{ p: 4 }}>
            {/* Header Workspace */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 4 }}>
              <Avatar sx={{
                width: 56, height: 56, borderRadius: 2, fontSize: '1.8rem',
                bgcolor: selectedWorkspace.color || '#0052CC', fontWeight: 700
              }}>
                {selectedWorkspace.logo || selectedWorkspace.title?.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant='h5' sx={{ fontWeight: 700 }}>
                    {selectedWorkspace.title}
                  </Typography>
                  <Chip
                    size='small'
                    icon={selectedWorkspace.type === 'private' ? <LockIcon sx={{ fontSize: 12 }} /> : <PublicIcon sx={{ fontSize: 12 }} />}
                    label={selectedWorkspace.type === 'private' ? 'Riêng tư' : 'Công khai'}
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                </Box>
                {selectedWorkspace.description && (
                  <Typography variant='body2' sx={{ opacity: 0.6, mb: 1 }}>
                    {selectedWorkspace.description}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Button size='small' startIcon={<PeopleIcon />} variant='outlined' sx={{ borderRadius: 2, textTransform: 'none', fontSize: '0.8rem' }}>
                    Thành viên ({(selectedWorkspace.ownerIds?.length || 0) + (selectedWorkspace.memberIds?.length || 0)})
                  </Button>
                  <Button size='small' startIcon={<SettingsIcon />} variant='outlined' sx={{ borderRadius: 2, textTransform: 'none', fontSize: '0.8rem' }}>
                    Cài đặt
                  </Button>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Boards Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DashboardIcon sx={{ opacity: 0.7 }} />
                <Typography variant='h6' sx={{ fontWeight: 700 }}>Boards</Typography>
              </Box>
              <Button
                variant='contained' size='small' startIcon={<AddIcon />}
                onClick={() => setOpenCreateBoard(true)}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Tạo Board
              </Button>
            </Box>

            {detailLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress size={32} />
              </Box>
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
                {/* Nút tạo board */}
                <Card
                  onClick={() => setOpenCreateBoard(true)}
                  sx={{
                    height: 96, cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexDirection: 'column', gap: 1,
                    border: `2px dashed ${borderColor}`,
                    bgcolor: 'transparent',
                    boxShadow: 'none',
                    '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', border: `2px dashed ${isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)'}` },
                    transition: 'all 0.15s ease'
                  }}
                >
                  <AddIcon sx={{ opacity: 0.5, fontSize: 28 }} />
                  <Typography variant='body2' sx={{ opacity: 0.5, fontWeight: 500 }}>
                    Tạo Board mới
                  </Typography>
                </Card>

                {(wsDetails?.boards || []).map(board => (
                  <Card
                    key={board._id}
                    onClick={() => navigate(`/boards/${board._id}`)}
                    sx={{
                      height: 96, cursor: 'pointer', position: 'relative', overflow: 'hidden',
                      background: board.cover
                        ? `url(${board.cover}) center/cover`
                        : `linear-gradient(135deg, ${board.color || '#0052CC'} 0%, ${board.color || '#0052CC'}cc 100%)`,
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: 6 },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Box sx={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.6) 100%)'
                    }} />
                    <CardContent sx={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'flex-end', p: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Typography variant='body2' sx={{ color: 'white', fontWeight: 700, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                        {board.title}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}

                {wsDetails && wsDetails.boards?.length === 0 && (
                  <Box sx={{ gridColumn: '1 / -1', py: 4, textAlign: 'center', opacity: 0.4 }}>
                    <DashboardIcon sx={{ fontSize: 48, mb: 1 }} />
                    <Typography>Workspace này chưa có board nào</Typography>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Modals */}
      <CreateWorkspaceModal
        open={openCreateWs}
        onClose={() => setOpenCreateWs(false)}
        onCreated={handleWorkspaceCreated}
      />
      <CreateBoardModal
        open={openCreateBoard}
        onClose={() => setOpenCreateBoard(false)}
        onCreated={handleBoardCreated}
        defaultWorkspaceId={selectedWorkspace?._id}
        workspaces={workspaces}
      />
    </Box>
  )
}

export default WorkspacesPage
