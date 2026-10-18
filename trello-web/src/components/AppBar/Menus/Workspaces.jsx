import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import CircularProgress from '@mui/material/CircularProgress'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import WorkspacesIcon from '@mui/icons-material/Workspaces'
import AddIcon from '@mui/icons-material/Add'
import LockIcon from '@mui/icons-material/Lock'
import { useDispatch, useSelector } from 'react-redux'
import { fetchWorkspacesThunk, selectWorkspaces, selectWorkspaceLoading } from '~/redux/workspace/workspaceSlice'
import CreateWorkspaceModal from '../CreateMenu/CreateWorkspaceModal'

function Workspaces() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const workspaces = useSelector(selectWorkspaces)
  const loading = useSelector(selectWorkspaceLoading)

  const [anchorEl, setAnchorEl] = useState(null)
  const [openCreateWs, setOpenCreateWs] = useState(false)
  const open = Boolean(anchorEl)

  useEffect(() => {
    dispatch(fetchWorkspacesThunk())
  }, [dispatch])

  const handleClick = (event) => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)

  const handleSelectWorkspace = (ws) => {
    handleClose()
    navigate(`/workspaces?id=${ws._id}`)
  }

  const handleViewAll = () => {
    handleClose()
    navigate('/workspaces')
  }

  return (
    <Box>
      <Button
        sx={{ color: 'white' }}
        id='basic-button-workspaces'
        aria-controls={open ? 'menu-workspaces' : undefined}
        aria-haspopup='true'
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        endIcon={<ExpandMoreIcon />}
      >
        Workspaces
      </Button>

      <Menu
        id='menu-workspaces'
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 8,
          sx: {
            borderRadius: 3, minWidth: 260, mt: 0.5,
            border: '1px solid', borderColor: 'divider'
          }
        }}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
          <Typography variant='caption' sx={{ fontWeight: 700, opacity: 0.5, textTransform: 'uppercase', letterSpacing: 1 }}>
            Workspaces của bạn
          </Typography>
        </Box>

        {loading && workspaces.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : workspaces.length === 0 ? (
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant='body2' sx={{ opacity: 0.5, mb: 1 }}>
              Bạn chưa có workspace nào
            </Typography>
          </Box>
        ) : (
          workspaces.map(ws => (
            <MenuItem
              key={ws._id}
              onClick={() => handleSelectWorkspace(ws)}
              sx={{ py: 1, px: 2, borderRadius: 2, mx: 1, my: 0.25 }}
            >
              <Avatar sx={{
                width: 28, height: 28, borderRadius: 1.5, mr: 1.5, fontSize: '0.9rem',
                bgcolor: ws.color || '#0052CC', fontWeight: 700
              }}>
                {ws.logo || ws.title?.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant='body2' sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ws.title}
                </Typography>
              </Box>
              {ws.type === 'private' && <LockIcon sx={{ fontSize: 12, opacity: 0.4 }} />}
            </MenuItem>
          ))
        )}

        <Divider sx={{ my: 1 }} />

        <MenuItem
          onClick={handleViewAll}
          sx={{ py: 1, px: 2, borderRadius: 2, mx: 1, my: 0.25 }}
        >
          <WorkspacesIcon sx={{ fontSize: 18, mr: 1.5, opacity: 0.6 }} />
          <Typography variant='body2' sx={{ fontWeight: 600 }}>Xem tất cả workspaces</Typography>
        </MenuItem>

        <MenuItem
          onClick={() => { handleClose(); setOpenCreateWs(true) }}
          sx={{ py: 1, px: 2, borderRadius: 2, mx: 1, my: 0.25 }}
        >
          <AddIcon sx={{ fontSize: 18, mr: 1.5, opacity: 0.6 }} />
          <Typography variant='body2' sx={{ fontWeight: 600 }}>Tạo workspace mới</Typography>
        </MenuItem>
        <Box sx={{ height: 4 }} />
      </Menu>

      <CreateWorkspaceModal
        open={openCreateWs}
        onClose={() => setOpenCreateWs(false)}
        onCreated={() => { setOpenCreateWs(false); dispatch(fetchWorkspacesThunk()) }}
      />
    </Box>
  )
}

export default Workspaces