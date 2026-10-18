import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActionArea from '@mui/material/CardActionArea'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import CircularProgress from '@mui/material/CircularProgress'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Tooltip from '@mui/material/Tooltip'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import ViewKanbanIcon from '@mui/icons-material/ViewKanban'
import PeopleIcon from '@mui/icons-material/People'
import CampaignIcon from '@mui/icons-material/Campaign'
import PersonIcon from '@mui/icons-material/Person'
import FolderIcon from '@mui/icons-material/Folder'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import defaultTemplates from '~/data/defaultTemplates.json'
import { fetchWorkspacesAPI, createBoardFromTemplateAPI } from '~/apis'
import { useTheme } from '@mui/material/styles'

const CATEGORY_TABS = [
  { id: 'all', label: 'Tất Cả', icon: <AutoAwesomeIcon sx={{ fontSize: 16 }} /> },
  { id: 'engineering', label: 'Kỹ Thuật', icon: <ViewKanbanIcon sx={{ fontSize: 16 }} /> },
  { id: 'marketing', label: 'Marketing', icon: <CampaignIcon sx={{ fontSize: 16 }} /> },
  { id: 'hr', label: 'Nhân Sự', icon: <PeopleIcon sx={{ fontSize: 16 }} /> },
  { id: 'project', label: 'Dự Án', icon: <FolderIcon sx={{ fontSize: 16 }} /> },
  { id: 'personal', label: 'Cá Nhân', icon: <PersonIcon sx={{ fontSize: 16 }} /> }
]

const PREVIEW_COLORS = ['#0052CC', '#00875A', '#FF5630', '#FF8B00', '#6554C0', '#00B8D9']

function ColumnPreview({ columns, color }) {
  return (
    <Box sx={{ display: 'flex', gap: 0.5, p: 1.5, pt: 0 }}>
      {columns.slice(0, 3).map((col, idx) => (
        <Box key={idx} sx={{ flex: 1 }}>
          <Box sx={{
            bgcolor: 'rgba(255,255,255,0.25)',
            borderRadius: 1,
            p: 0.5,
            mb: 0.5
          }}>
            <Typography sx={{ fontSize: '0.55rem', fontWeight: 700, color: 'white', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {col}
            </Typography>
          </Box>
          {[...Array(idx === 0 ? 3 : idx === 1 ? 2 : 1)].map((_, i) => (
            <Box key={i} sx={{ bgcolor: 'rgba(255,255,255,0.18)', borderRadius: 0.5, height: 6, mb: 0.4 }} />
          ))}
        </Box>
      ))}
      {columns.length > 3 && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', px: 0.5 }}>
          <Typography sx={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>
            +{columns.length - 3}
          </Typography>
        </Box>
      )}
    </Box>
  )
}

function UseTemplateModal({ template, open, onClose, onSuccess }) {
  const [boardName, setBoardName] = useState(template?.name ? `Bảng ${template.name}` : '')
  const [workspaceId, setWorkspaceId] = useState('')
  const [workspaces, setWorkspaces] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (open) {
      setBoardName(template?.name ? `Bảng ${template.name}` : '')
      fetchWorkspacesAPI().then(setWorkspaces).catch(() => setWorkspaces([]))
    }
  }, [open, template])

  const handleCreate = async () => {
    if (!boardName.trim()) return
    setLoading(true)
    try {
      const payload = {
        title: boardName.trim(),
        description: template?.description || boardName.trim(),
        type: 'public',
        workspaceId: workspaceId || null,
        templateColumns: template?.columns || [],
        cover: null
      }
      const newBoard = await createBoardFromTemplateAPI(payload)
      onSuccess?.(newBoard)
      navigate(`/boards/${newBoard._id}`)
    } finally {
      setLoading(false)
    }
  }

  if (!template) return null
  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Typography sx={{ fontSize: '1.5rem' }}>{template.icon}</Typography>
        <Box>
          <Typography variant='h6' sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            Dùng mẫu: {template.name}
          </Typography>
          <Typography variant='caption' sx={{ opacity: 0.5 }}>
            Sẽ tạo board với {template.columns.length} cột
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        {/* Preview columns */}
        <Box sx={{
          borderRadius: 2, mb: 3, overflow: 'hidden',
          background: template.color,
          height: 80, display: 'flex', alignItems: 'flex-end'
        }}>
          <ColumnPreview columns={template.columns} color={template.color} />
        </Box>

        <TextField
          fullWidth label='Tên Board' variant='outlined' size='small'
          value={boardName} onChange={e => setBoardName(e.target.value)}
          sx={{ mb: 2 }} autoFocus
          helperText={`Các cột sẽ được tạo: ${template.columns.join(' → ')}`}
        />
        <FormControl fullWidth size='small'>
          <InputLabel>Workspace (tuỳ chọn)</InputLabel>
          <Select value={workspaceId} onChange={e => setWorkspaceId(e.target.value)} label='Workspace (tuỳ chọn)'>
            <MenuItem value=''><em>Không có</em></MenuItem>
            {workspaces.map(ws => (
              <MenuItem key={ws._id} value={ws._id}>{ws.title}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>Huỷ</Button>
        <Button
          variant='contained' onClick={handleCreate}
          disabled={!boardName.trim() || loading}
          startIcon={loading ? <CircularProgress size={16} /> : <CheckCircleIcon />}
          sx={{ borderRadius: 2, px: 3 }}
        >
          {loading ? 'Đang tạo...' : 'Tạo Board'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

function TemplatesPage() {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const [activeTab, setActiveTab] = useState('all')
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const filtered = activeTab === 'all'
    ? defaultTemplates
    : defaultTemplates.filter(t => t.category === activeTab)

  const handleUseTemplate = (t) => {
    setSelectedTemplate(t)
    setModalOpen(true)
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: 4, py: 5 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Box sx={{
          width: 56, height: 56, borderRadius: 3, mx: 'auto', mb: 2,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <AutoAwesomeIcon sx={{ color: 'white', fontSize: 28 }} />
        </Box>
        <Typography variant='h4' sx={{ fontWeight: 800, mb: 1 }}>
          Thư Viện Mẫu
        </Typography>
        <Typography variant='body1' sx={{ opacity: 0.55, maxWidth: 520, mx: 'auto' }}>
          Bắt đầu nhanh hơn với các mẫu được thiết kế sẵn bởi đội ngũ chuyên gia.
          Chọn mẫu phù hợp với nhu cầu của bạn.
        </Typography>
      </Box>

      {/* Category Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant='scrollable' scrollButtons='auto'
        >
          {CATEGORY_TABS.map(tab => (
            <Tab
              key={tab.id} value={tab.id}
              label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>{tab.icon}{tab.label}</Box>}
              sx={{ textTransform: 'none', fontWeight: 600, minHeight: 48 }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Templates Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 2.5 }}>
        {filtered.map(template => (
          <Card
            key={template.id}
            sx={{
              borderRadius: 3, overflow: 'hidden', cursor: 'pointer',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: 10 },
              '&:hover .use-btn': { opacity: 1, transform: 'translateY(0)' },
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onClick={() => handleUseTemplate(template)}
          >
            {/* Preview Area */}
            <Box sx={{
              height: 140, bgcolor: template.color, position: 'relative', p: 1.5, pb: 0,
              display: 'flex', flexDirection: 'column'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography sx={{ fontSize: '1.4rem' }}>{template.icon}</Typography>
                <Chip
                  label={template.categoryLabel}
                  size='small'
                  sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: 'white', fontWeight: 600, fontSize: '0.65rem', height: 20 }}
                />
              </Box>
              <ColumnPreview columns={template.columns} color={template.color} />

              {/* Hover overlay */}
              <Box className='use-btn' sx={{
                position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.55)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: 0, transform: 'translateY(4px)',
                transition: 'all 0.2s ease', borderRadius: 0
              }}>
                <Button variant='contained' size='small' sx={{ borderRadius: 2, bgcolor: 'white', color: 'black', fontWeight: 700, '&:hover': { bgcolor: 'white' } }}>
                  Dùng Mẫu Này
                </Button>
              </Box>
            </Box>

            <CardContent sx={{ pb: '12px !important' }}>
              <Typography variant='body1' sx={{ fontWeight: 700, mb: 0.5 }}>
                {template.name}
              </Typography>
              <Typography variant='caption' sx={{ opacity: 0.55, display: 'block', mb: 1, lineHeight: 1.4 }}>
                {template.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {template.columns.slice(0, 3).map((col, i) => (
                  <Chip key={i} label={col} size='small' sx={{ height: 18, fontSize: '0.6rem', borderRadius: 1 }} />
                ))}
                {template.columns.length > 3 && (
                  <Chip label={`+${template.columns.length - 3}`} size='small' sx={{ height: 18, fontSize: '0.6rem', borderRadius: 1 }} />
                )}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Use Template Modal */}
      <UseTemplateModal
        template={selectedTemplate}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => setModalOpen(false)}
      />
    </Box>
  )
}

export default TemplatesPage
