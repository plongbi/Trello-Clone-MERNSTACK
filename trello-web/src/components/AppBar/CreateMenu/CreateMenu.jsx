import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import LibraryAddIcon from '@mui/icons-material/LibraryAdd'
import DashboardIcon from '@mui/icons-material/Dashboard'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import GroupWorkIcon from '@mui/icons-material/GroupWork'
import CreateBoardModal from './CreateBoardModal'
import CreateWorkspaceModal from './CreateWorkspaceModal'
import { useSelector } from 'react-redux'
import { selectWorkspaces } from '~/redux/workspace/workspaceSlice'

function CreateMenu() {
  const navigate = useNavigate()
  const workspaces = useSelector(selectWorkspaces)

  const [anchorEl, setAnchorEl] = useState(null)
  const [openBoardModal, setOpenBoardModal] = useState(false)
  const [openWsModal, setOpenWsModal] = useState(false)

  const open = Boolean(anchorEl)

  const handleOpenMenu = (e) => setAnchorEl(e.currentTarget)
  const handleCloseMenu = () => setAnchorEl(null)

  const handleCreateBoard = () => {
    handleCloseMenu()
    setOpenBoardModal(true)
  }

  const handleStartWithTemplate = () => {
    handleCloseMenu()
    navigate('/templates')
  }

  const handleCreateWorkspace = () => {
    handleCloseMenu()
    setOpenWsModal(true)
  }

  const handleBoardCreated = (newBoard) => {
    setOpenBoardModal(false)
    navigate(`/boards/${newBoard._id}`)
  }

  const handleWsCreated = (newWs) => {
    setOpenWsModal(false)
    navigate(`/workspaces?id=${newWs._id}`)
  }

  return (
    <>
      <Button
        id='create-menu-btn'
        variant='contained'
        startIcon={<LibraryAddIcon />}
        onClick={handleOpenMenu}
        aria-controls={open ? 'create-menu' : undefined}
        aria-haspopup='true'
        aria-expanded={open ? 'true' : undefined}
        sx={{
          color: 'white',
          bgcolor: 'rgba(255,255,255,0.2)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: 2,
          fontWeight: 600,
          textTransform: 'none',
          px: 2,
          '&:hover': {
            bgcolor: 'rgba(255,255,255,0.3)',
            border: '1px solid rgba(255,255,255,0.5)'
          }
        }}
      >
        Create
      </Button>

      <Menu
        id='create-menu'
        anchorEl={anchorEl}
        open={open}
        onClose={handleCloseMenu}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        PaperProps={{
          elevation: 8,
          sx: {
            borderRadius: 3, minWidth: 280, mt: 0.5,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'visible',
            '& .MuiMenuItem-root': {
              borderRadius: 2, mx: 1, my: 0.25,
              '&:hover': { bgcolor: 'action.hover' }
            }
          }
        }}
      >
        {/* Header */}
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant='caption' sx={{ fontWeight: 700, opacity: 0.5, textTransform: 'uppercase', letterSpacing: 1 }}>
            Quick Create
          </Typography>
        </Box>

        {/* Option 1: Tạo Bảng */}
        <MenuItem onClick={handleCreateBoard} sx={{ py: 1.5 }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: 2, mr: 1.5, flexShrink: 0,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <DashboardIcon sx={{ fontSize: 18, color: 'white' }} />
          </Box>
          <Box>
            <Typography variant='body2' sx={{ fontWeight: 700 }}>Create Board</Typography>
            <Typography variant='caption' sx={{ opacity: 0.55, display: 'block' }}>
              A board is a place to organize your work lists
            </Typography>
          </Box>
        </MenuItem>

        {/* Option 2: Bắt đầu với Mẫu */}
        <MenuItem onClick={handleStartWithTemplate} sx={{ py: 1.5 }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: 2, mr: 1.5, flexShrink: 0,
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <AutoAwesomeIcon sx={{ fontSize: 18, color: 'white' }} />
          </Box>
          <Box>
            <Typography variant='body2' sx={{ fontWeight: 700 }}>Start With a Template</Typography>
            <Typography variant='caption' sx={{ opacity: 0.55, display: 'block' }}>
              Use a pre-designed template to get started
            </Typography>
          </Box>
        </MenuItem>

        <Divider sx={{ my: 1 }} />

        {/* Option 3: Tạo Workspace */}
        <MenuItem onClick={handleCreateWorkspace} sx={{ py: 1.5 }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: 2, mr: 1.5, flexShrink: 0,
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <GroupWorkIcon sx={{ fontSize: 18, color: 'white' }} />
          </Box>
          <Box>
            <Typography variant='body2' sx={{ fontWeight: 700 }}>Create Workspace</Typography>
            <Typography variant='caption' sx={{ opacity: 0.55, display: 'block' }}>
              Group boards together for team collaboration
            </Typography>
          </Box>
        </MenuItem>

        <Box sx={{ height: 8 }} />
      </Menu>

      {/* Modals */}
      <CreateBoardModal
        open={openBoardModal}
        onClose={() => setOpenBoardModal(false)}
        onCreated={handleBoardCreated}
        workspaces={workspaces}
      />
      <CreateWorkspaceModal
        open={openWsModal}
        onClose={() => setOpenWsModal(false)}
        onCreated={handleWsCreated}
      />
    </>
  )
}

export default CreateMenu
