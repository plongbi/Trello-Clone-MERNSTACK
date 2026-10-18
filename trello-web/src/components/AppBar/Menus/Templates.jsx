import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import defaultTemplates from '~/data/defaultTemplates.json'

function Templates() {
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const handleClick = (event) => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)

  const topTemplates = defaultTemplates.slice(0, 5)

  return (
    <Box>
      <Button
        sx={{ color: 'white' }}
        id='basic-button-templates'
        aria-controls={open ? 'menu-templates' : undefined}
        aria-haspopup='true'
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        endIcon={<ExpandMoreIcon />}
      >
        Templates
      </Button>

      <Menu
        id='menu-templates'
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
            Mẫu Phổ Biến
          </Typography>
        </Box>

        {topTemplates.map(template => (
          <MenuItem
            key={template.id}
            onClick={() => { handleClose(); navigate('/templates') }}
            sx={{ py: 1, px: 2, borderRadius: 2, mx: 1, my: 0.25 }}
          >
            <Box sx={{
              width: 28, height: 28, borderRadius: 1.5, mr: 1.5, flexShrink: 0,
              bgcolor: template.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.9rem'
            }}>
              {template.icon}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant='body2' sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {template.name}
              </Typography>
              <Typography variant='caption' sx={{ opacity: 0.4 }}>
                {template.columns.slice(0, 3).join(' · ')}
              </Typography>
            </Box>
          </MenuItem>
        ))}

        <Divider sx={{ my: 1 }} />
        <MenuItem
          onClick={() => { handleClose(); navigate('/templates') }}
          sx={{ py: 1, px: 2, borderRadius: 2, mx: 1, my: 0.25 }}
        >
          <AutoAwesomeIcon sx={{ fontSize: 18, mr: 1.5, opacity: 0.6 }} />
          <Typography variant='body2' sx={{ fontWeight: 600 }}>Xem thêm mẫu</Typography>
        </MenuItem>
        <Box sx={{ height: 4 }} />
      </Menu>
    </Box>
  )
}

export default Templates