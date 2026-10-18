import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import ModeCommentIcon from '@mui/icons-material/ModeComment'
import { Card as MuiCard } from '@mui/material'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import GroupIcon from '@mui/icons-material/Group'
import CardMedia from '@mui/material/CardMedia'
import AttachmentIcon from '@mui/icons-material/Attachment'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import Tooltip from '@mui/material/Tooltip'
import Box from '@mui/material/Box'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useDispatch } from 'react-redux'
import { updateCurrentActiveCard, showModalActiveCard } from '~/redux/activeCard/activeCardSlice'

function Card({ card }) {
  const dispatch = useDispatch()

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card._id,
    data: { ...card }
  })
  const dndKitCardStyles = {
    // touchAction: 'none', // Dành cho sensor default dạng pointersensor
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    border: isDragging ? '1px solid #2ecc71' : undefined
  }

  const shouldShowCardActions = () => {
    return !!card?.memberIds?.length || !!card?.comments?.length || !!card?.attachments?.length
  }

  const setActiveCard = () => {
    // Update data cho activeCard trong redux
    dispatch(updateCurrentActiveCard(card))

    // Hiện modal activeCard lên
    dispatch(showModalActiveCard())
  }

  const isDone = !!card?.isDone
  const isOverdue = card?.deadline && !isDone && (new Date(card.deadline) < new Date())

  return (
    <MuiCard
      onClick={setActiveCard}
      ref={setNodeRef} style={dndKitCardStyles} {...attributes} {...listeners}
      sx={{
        cursor: 'pointer',
        boxShadow: isOverdue ? '0 1px 6px rgba(231,76,60,0.45)' : (isDone ? '0 1px 6px rgba(39,174,96,0.35)' : '0 1px 1px rgba(0, 0, 0, 0.2)'),
        overflow: 'unset',
        display: card?.FE_PlaceholderCard ? 'none' : 'block',
        border: isOverdue ? '1.5px solid #e74c3c' : (isDone ? '1.5px solid #27ae60' : '1px solid transparent'),
        '&:hover': { borderColor: (theme) => isOverdue ? '#e74c3c' : (isDone ? '#27ae60' : theme.palette.primary.main) }
      }}>
      {card?.cover && <CardMedia sx={{ height: 140 } } image={card?.cover}/>}

      <CardContent sx={{ p: 1.5, '&:last-child':{ p: 1.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.5 }}>
          <Typography sx={{ flex: 1 }}>{card?.title}</Typography>
          {/* Badge isDone */}
          {isDone && (
            <Tooltip title="Done ✔" arrow placement="top">
              <CheckCircleIcon sx={{ fontSize: '16px', color: '#27ae60', flexShrink: 0 }} />
            </Tooltip>
          )}
        </Box>
      </CardContent>

      {shouldShowCardActions() &&
        <CardActions sx={{ p: '0 4px 8px 4px' }}>
          {!!card?.memberIds?.length &&
            <Button size="small" startIcon={<GroupIcon />}>{card?.memberIds?.length}</Button>
          }
          {!!card?.comments?.length &&
            <Button size="small" startIcon={<ModeCommentIcon />}>{card?.comments?.length}</Button>
          }
          {!!card?.attachments?.length &&
            <Button size="small" startIcon={<AttachmentIcon />}>{card?.attachments?.length}</Button>
          }
        </CardActions>
      }
    </MuiCard>
  )
}

export default Card
