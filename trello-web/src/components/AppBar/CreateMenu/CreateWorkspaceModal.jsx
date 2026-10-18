import { useState, useEffect } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Tooltip from '@mui/material/Tooltip'
import GroupWorkIcon from '@mui/icons-material/GroupWork'
import LockIcon from '@mui/icons-material/Lock'
import PublicIcon from '@mui/icons-material/Public'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { createWorkspaceAPI } from '~/apis'
import { useDispatch } from 'react-redux'
import { createWorkspaceThunk } from '~/redux/workspace/workspaceSlice'

const WS_COLORS = [
  '#0052CC', '#00875A', '#FF5630', '#FF8B00',
  '#6554C0', '#00B8D9', '#36B37E', '#403294'
]

const WS_EMOJIS = ['🚀', '⚡', '🎯', '💼', '🌟', '🔥', '💡', '🎨']

function CreateWorkspaceModal({ open, onClose, onCreated }) {
  const dispatch = useDispatch()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('public')
  const [color, setColor] = useState(WS_COLORS[0])
  const [logo, setLogo] = useState(WS_EMOJIS[0])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setTitle('')
      setDescription('')
      setType('public')
      setColor(WS_COLORS[0])
      setLogo(WS_EMOJIS[0])
    }
  }, [open])

  const isValid = title.trim().length >= 3

  const handleCreate = async () => {
    if (!isValid) return
    setLoading(true)
    try {
      const result = await dispatch(createWorkspaceThunk({
        title: title.trim(),
        description: description.trim(),
        type,
        color,
        logo
      }))
      if (result.payload) {
        onCreated?.(result.payload)
        onClose()
      }
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
          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <GroupWorkIcon sx={{ color: 'white', fontSize: 18 }} />
        </Box>
        <Typography variant='h6' sx={{ fontWeight: 700 }}>Create Workspace</Typography>
      </DialogTitle>

      <DialogContent>
        {/* Preview avatar */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box sx={{
            width: 64, height: 64, borderRadius: 3, flexShrink: 0,
            bgcolor: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem', transition: 'background-color 0.3s ease',
            boxShadow: `0 4px 14px ${color}66`
          }}>
            {logo}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant='body1' sx={{ fontWeight: 700, mb: 0.5 }}>
              {title || 'Workspace Name'}
            </Typography>
            <Typography variant='caption' sx={{ opacity: 0.5 }}>
              {description || 'Describe your workspace'}
            </Typography>
          </Box>
        </Box>

        {/* Emoji picker */}
        <Box sx={{ mb: 2 }}>
          <Typography variant='caption' sx={{ fontWeight: 600, opacity: 0.6, mb: 1, display: 'block' }}>
            Logo
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {WS_EMOJIS.map(e => (
              <Box
                key={e} onClick={() => setLogo(e)}
                sx={{
                  width: 36, height: 36, borderRadius: 2, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.2rem',
                  border: logo === e ? '2px solid' : '2px solid transparent',
                  borderColor: logo === e ? 'primary.main' : 'transparent',
                  bgcolor: logo === e ? 'action.selected' : 'action.hover',
                  transition: 'all 0.15s ease',
                  '&:hover': { transform: 'scale(1.2)' }
                }}
              >
                {e}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Color picker */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant='caption' sx={{ fontWeight: 600, opacity: 0.6, mb: 1, display: 'block' }}>
            Color
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {WS_COLORS.map(c => (
              <Box
                key={c} onClick={() => setColor(c)}
                sx={{
                  width: 28, height: 28, borderRadius: 1.5, cursor: 'pointer', bgcolor: c,
                  border: color === c ? '2px solid white' : '2px solid transparent',
                  boxShadow: color === c ? `0 0 0 2px ${c}` : 'none',
                  transition: 'all 0.15s ease',
                  '&:hover': { transform: 'scale(1.2)' }
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Tên workspace */}
        <TextField
          fullWidth label='Workspace Name *' variant='outlined' size='small'
          value={title} onChange={e => setTitle(e.target.value)}
          placeholder='e.g. Website Project, Marketing Team...'
          sx={{ mb: 2 }} autoFocus
          error={title.length > 0 && title.trim().length < 3}
          helperText={title.length > 0 && title.trim().length < 3 ? 'Minimum 3 characters' : ''}
        />

        {/* Mô tả */}
        <TextField
          fullWidth label='Description (optional)' variant='outlined' size='small'
          value={description} onChange={e => setDescription(e.target.value)}
          placeholder='What is this workspace for?'
          multiline rows={2} sx={{ mb: 2 }}
        />

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
          {loading ? 'Creating...' : 'Create Workspace'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CreateWorkspaceModal
