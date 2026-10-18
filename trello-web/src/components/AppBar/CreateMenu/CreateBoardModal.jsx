import { useState, useEffect } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Tooltip from '@mui/material/Tooltip'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import LockIcon from '@mui/icons-material/Lock'
import PublicIcon from '@mui/icons-material/Public'
import DashboardIcon from '@mui/icons-material/Dashboard'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { createNewBoardAPI, fetchWorkspacesAPI } from '~/apis'
import { toast } from 'react-toastify'

// Board cover color presets
const COVER_COLORS = [
  { value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', label: 'Purple' },
  { value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', label: 'Pink' },
  { value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', label: 'Blue' },
  { value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', label: 'Green' },
  { value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', label: 'Orange-Red' },
  { value: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', label: 'Lavender' },
  { value: 'linear-gradient(135deg, #0052CC 0%, #0065FF 100%)', label: 'Navy' },
  { value: 'linear-gradient(135deg, #00875A 0%, #00B8D9 100%)', label: 'Teal' }
]

function CreateBoardModal({ open, onClose, onCreated, defaultWorkspaceId, workspaces: propWorkspaces }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('public')
  const [workspaceId, setWorkspaceId] = useState(defaultWorkspaceId || '')
  const [selectedCover, setSelectedCover] = useState(COVER_COLORS[0].value)
  const [loading, setLoading] = useState(false)
  const [workspaces, setWorkspaces] = useState(propWorkspaces || [])

  useEffect(() => {
    if (open) {
      setTitle('')
      setDescription('')
      setType('public')
      setWorkspaceId(defaultWorkspaceId || '')
      setSelectedCover(COVER_COLORS[0].value)
      // Nếu chưa có workspaces thì fetch
      if (!propWorkspaces || propWorkspaces.length === 0) {
        fetchWorkspacesAPI().then(setWorkspaces).catch(() => {})
      } else {
        setWorkspaces(propWorkspaces)
      }
    }
  }, [open, defaultWorkspaceId])

  const isValid = title.trim().length >= 3

  const handleCreate = async () => {
    if (!isValid) {
      toast.warning('Board name must be at least 3 characters!')
      return
    }
    setLoading(true)
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || title.trim(),
        type,
        workspaceId: workspaceId || null,
        cover: selectedCover
      }
      const newBoard = await createNewBoardAPI(payload)
      onCreated?.(newBoard)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
        <Box sx={{
          width: 36, height: 36, borderRadius: 2,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <DashboardIcon sx={{ color: 'white', fontSize: 18 }} />
        </Box>
        <Typography variant='h6' sx={{ fontWeight: 700 }}>Create New Board</Typography>
      </DialogTitle>

      <DialogContent>
        {/* Cover preview */}
        <Box sx={{
          height: 100, borderRadius: 2, mb: 2.5,
          background: selectedCover,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.3s ease'
        }}>
          <Typography variant='h6' sx={{ color: 'white', fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
            {title || 'Board Name'}
          </Typography>
        </Box>

        {/* Color picker */}
        <Box sx={{ mb: 2 }}>
          <Typography variant='caption' sx={{ fontWeight: 600, opacity: 0.6, mb: 1, display: 'block' }}>
            Background Color
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {COVER_COLORS.map(c => (
              <Tooltip key={c.value} title={c.label}>
                <Box
                  onClick={() => setSelectedCover(c.value)}
                  sx={{
                    width: 32, height: 32, borderRadius: 1.5, cursor: 'pointer',
                    background: c.value,
                    border: selectedCover === c.value ? '2px solid white' : '2px solid transparent',
                    boxShadow: selectedCover === c.value ? '0 0 0 2px #1560c5' : 'none',
                    transition: 'all 0.15s ease',
                    '&:hover': { transform: 'scale(1.15)' }
                  }}
                />
              </Tooltip>
            ))}
          </Box>
        </Box>

        {/* Board name */}
        <TextField
          fullWidth label='Board Name *' variant='outlined' size='small'
          value={title} onChange={e => setTitle(e.target.value)}
          placeholder='e.g. July Sprint, Website Redesign...'
          sx={{ mb: 2 }} autoFocus
          error={title.length > 0 && title.trim().length < 3}
          helperText={title.length > 0 && title.trim().length < 3 ? 'Minimum 3 characters' : ''}
        />

        {/* Workspace select */}
        <FormControl fullWidth size='small' sx={{ mb: 2 }}>
          <InputLabel>Workspace</InputLabel>
          <Select value={workspaceId} onChange={e => setWorkspaceId(e.target.value)} label='Workspace'>
            <MenuItem value=''><em>No workspace</em></MenuItem>
            {workspaces.map(ws => (
              <MenuItem key={ws._id} value={ws._id}>{ws.title}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Visibility */}
        <Box>
          <Typography variant='caption' sx={{ fontWeight: 600, opacity: 0.6, mb: 1, display: 'block' }}>
            Visibility
          </Typography>
          <ToggleButtonGroup
            value={type} exclusive
            onChange={(_, v) => v && setType(v)}
            size='small' fullWidth
          >
            <ToggleButton value='public' sx={{ textTransform: 'none', gap: 0.5, fontWeight: 600 }}>
              <PublicIcon fontSize='small' />
              Public
            </ToggleButton>
            <ToggleButton value='private' sx={{ textTransform: 'none', gap: 0.5, fontWeight: 600 }}>
              <LockIcon fontSize='small' />
              Private
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose} disabled={loading} sx={{ borderRadius: 2 }}>Cancel</Button>
        <Button
          variant='contained' onClick={handleCreate}
          disabled={!isValid || loading}
          startIcon={loading ? <CircularProgress size={16} color='inherit' /> : <CheckCircleIcon />}
          sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}
        >
          {loading ? 'Creating...' : 'Create Board'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CreateBoardModal
