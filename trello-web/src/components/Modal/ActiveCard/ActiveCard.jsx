import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import CancelIcon from '@mui/icons-material/Cancel'
import Grid from '@mui/material/Unstable_Grid2'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import DeleteIcon from '@mui/icons-material/Delete'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined'
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined'
import WatchLaterOutlinedIcon from '@mui/icons-material/WatchLaterOutlined'
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined'
import AspectRatioOutlinedIcon from '@mui/icons-material/AspectRatioOutlined'
import AddToDriveOutlinedIcon from '@mui/icons-material/AddToDriveOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined'
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import SubjectRoundedIcon from '@mui/icons-material/SubjectRounded'
import DvrOutlinedIcon from '@mui/icons-material/DvrOutlined'
import LinearProgress from '@mui/material/LinearProgress'
import Chip from '@mui/material/Chip'
import SpeedIcon from '@mui/icons-material/Speed'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import Alert from '@mui/material/Alert'
import ToggleFocusInput from '~/components/Form/ToggleFocusInput'
import VisuallyHiddenInput from '~/components/Form/VisuallyHiddenInput'
import { singleFileValidator, attachmentFilesValidator } from '~/utils/validators'
import { toast } from 'react-toastify'
import moment from 'moment'
import Popover from '@mui/material/Popover'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import CardUserGroup from './CardUserGroup'
import CardDescriptionMdEditor from './CardDescriptionMdEditor'
import CardActivitySection from './CardActivitySection'
import CardAttachmentSection from './CardAttachmentSection'
import { styled } from '@mui/material/styles'
import { useDispatch, useSelector } from 'react-redux'
import {
  clearAndHideCurrentActiveCard,
  selectCurrentActiveCard,
  updateCurrentActiveCard,
  selectIsShowModalActiveCard
} from '~/redux/activeCard/activeCardSlice'
import { updateCardDetailsAPI, deleteCardDetailsAPI, uploadCardAttachmentsAPI, removeCardAttachmentAPI } from '~/apis'
import { updateCardInBoard, selectCurrentActiveBoard, updateCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { CARD_MEMBER_ACTIONS } from '~/utils/constants'
import PersonRemoveIcon from '@mui/icons-material/PersonRemove'
import { useConfirm } from 'material-ui-confirm'
import { cloneDeep, isEmpty } from 'lodash'
import { generatePlaceholderCard } from '~/utils/formatters'
import { useState, useEffect } from 'react'

const SidebarItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600',
  color: theme.palette.mode === 'dark' ? '#90caf9' : '#172b4d',
  backgroundColor: theme.palette.mode === 'dark' ? '#2f3542' : '#091e420f',
  padding: '10px',
  borderRadius: '4px',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? '#33485D' : theme.palette.grey[300],
    '&.active': {
      color: theme.palette.mode === 'dark' ? '#000000de' : '#0c66e4',
      backgroundColor: theme.palette.mode === 'dark' ? '#90caf9' : '#e9f2ff'
    }
  }
}))

function ActiveCard() {
  const dispatch = useDispatch()
  const activeCard = useSelector(selectCurrentActiveCard)
  const isShowModalActiveCard = useSelector(selectIsShowModalActiveCard)
  const currentUser = useSelector(selectCurrentUser)
  const board = useSelector(selectCurrentActiveBoard)

  const [dateAnchorEl, setDateAnchorEl] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')

  useEffect(() => {
    if (activeCard?.deadline) {
      setSelectedDate(moment(activeCard.deadline).format('YYYY-MM-DDTHH:mm'))
    } else {
      setSelectedDate('')
    }
  }, [activeCard?.deadline])

  const handleOpenDatePicker = (event) => setDateAnchorEl(event.currentTarget)
  const handleCloseDatePicker = () => setDateAnchorEl(null)


  const getDeadlineBadge = () => {
    if (!activeCard?.deadline) return null
    if (activeCard.isDone) {
      return (
        <Chip
          label="Completed"
          color="success"
          size="small"
          sx={{ height: '20px', fontSize: '10px', fontWeight: 600 }}
        />
      )
    }
    const diffMs = new Date(activeCard.deadline) - new Date()
    if (diffMs < 0) {
      return (
        <Chip
          label="Overdue"
          color="error"
          size="small"
          sx={{ height: '20px', fontSize: '10px', fontWeight: 600 }}
        />
      )
    }
    // Ngưỡng 5 phút: 5 * 60 * 1000
    if (diffMs <= 5 * 60 * 1000) {
      return (
        <Chip
          label="Due Soon"
          color="warning"
          size="small"
          sx={{ height: '20px', fontSize: '10px', fontWeight: 600 }}
        />
      )
    }
    return (
      <Chip
        label="In Progress"
        color="info"
        size="small"
        sx={{ height: '20px', fontSize: '10px', fontWeight: 600 }}
      />
    )
  }

  const cardOwner = board?.FE_allUsers?.find(u => activeCard?.ownerIds?.includes(u._id))

  const handleCloseModal = () => {
    dispatch(clearAndHideCurrentActiveCard())
  }

  const confirmDeleteCard = useConfirm()
  const handleDeleteCard = () => {
    confirmDeleteCard({
      title: 'Delete card?',
      description: 'This action will permanently delete your card! Are you sure?',
      confirmationText: 'Confirm',
      cancellationText: 'Cancel'
    }).then(() => {
      // Update data state board
      const newBoard = cloneDeep(board)
      const columnToUpdate = newBoard.columns.find(c => c._id === activeCard.columnId)
      if (columnToUpdate) {
        columnToUpdate.cards = columnToUpdate.cards.filter(c => c._id !== activeCard._id)
        columnToUpdate.cardOrderIds = columnToUpdate.cardOrderIds.filter(_id => _id !== activeCard._id)

        // Add placeholder card if empty
        if (isEmpty(columnToUpdate.cards)) {
          columnToUpdate.cards = [generatePlaceholderCard(columnToUpdate)]
          columnToUpdate.cardOrderIds = [generatePlaceholderCard(columnToUpdate)._id]
        }
      }
      dispatch(updateCurrentActiveBoard(newBoard))
      handleCloseModal()

      // Call API
      deleteCardDetailsAPI(activeCard._id).then(res => {
        toast.success(res?.deleteResult || 'Card deleted successfully')
      })
    }).catch(() => { })
  }

  // Fuction dùng chung cho các TH update card title, description,...
  const callApiUpdateCard = async (updateData) => {
    const updatedCard = await updateCardDetailsAPI(activeCard._id, updateData)

    // B1: Update card đang active trong modal hiện tại
    dispatch(updateCurrentActiveCard(updatedCard))

    // B2: Update bản ghi card trong activeBoard (nested data)
    dispatch(updateCardInBoard(updatedCard))

    return updatedCard
  }

  const handleSaveDeadline = async () => {
    if (!selectedDate) return
    const timestamp = new Date(selectedDate).getTime()
    await callApiUpdateCard({ deadline: timestamp })
    toast.success('Deadline saved!', { position: 'bottom-right' })
    handleCloseDatePicker()
  }

  const handleRemoveDeadline = async () => {
    await callApiUpdateCard({ deadline: null })
    toast.success('Deadline removed!', { position: 'bottom-right' })
    setSelectedDate('')
    handleCloseDatePicker()
  }

  const onUpdateCardTitle = (newTitle) => {
    callApiUpdateCard({ title: newTitle.trim() })
  }

  const onUpdateCardDescription = (newDescription) => {
    callApiUpdateCard({ description: newDescription })
  }

  const onUploadCardCover = (event) => {
    const error = singleFileValidator(event.target?.files[0])
    if (error) {
      toast.error(error)
      return
    }
    let reqData = new FormData()
    reqData.append('cardCover', event.target?.files[0])

    // Gọi API
    toast.promise(
      callApiUpdateCard(reqData).finally(() => event.target.value = ''),
      { pending: 'Updating...' }
    )
  }

  // Dùng async await để component CardActivitySection chờ và nếu thành công thì mới clear thẻ imput comment
  const onAddCardComment = async (commentToAdd) => {
    await callApiUpdateCard({ commentToAdd })
  }

  const onUpdateCardComment = async (commentToUpdate) => {
    await callApiUpdateCard({ commentToUpdate })
  }

  const onDeleteCardComment = async (commentToDelete) => {
    await callApiUpdateCard({ commentToDelete })
  }

  const onUpdateCardMembers = (incomingMemberInfo) => {
    callApiUpdateCard({ incomingMemberInfo })
  }

  // Attachment state
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false)

  const onUploadAttachments = async (event) => {
    const files = Array.from(event.target?.files || [])
    if (!files.length) return

    const error = attachmentFilesValidator(files)
    if (error) {
      toast.error(error)
      event.target.value = ''
      return
    }

    const formData = new FormData()
    files.forEach(file => formData.append('attachments', file))

    setIsUploadingAttachment(true)
    try {
      const updatedCard = await uploadCardAttachmentsAPI(activeCard._id, formData)
      dispatch(updateCurrentActiveCard(updatedCard))
      dispatch(updateCardInBoard(updatedCard))
      toast.success(`${files.length} file(s) uploaded successfully!`)
    } catch (err) {
      toast.error('Upload failed. Please check your Cloudinary configuration.')
    } finally {
      setIsUploadingAttachment(false)
      event.target.value = ''
    }
  }

  const onRemoveAttachment = async (publicId) => {
    try {
      const updatedCard = await removeCardAttachmentAPI(activeCard._id, publicId)
      dispatch(updateCurrentActiveCard(updatedCard))
      dispatch(updateCardInBoard(updatedCard))
      toast.success('Attachment removed!')
    } catch (err) {
      toast.error('Failed to remove attachment.')
    }
  }

  // ====== Tính toán trước khi render ======
  // isDone của card này
  const isDone = !!activeCard?.isDone

  // Tìm column chứa card hiện tại
  const currentColumn = board?.columns?.find(c => c._id === activeCard?.columnId)

  // Tính tiến trình của column: số card isDone / tổng số card thực sự (không đếm placeholder)
  const realCards = currentColumn?.cards?.filter(c => !c.FE_PlaceholderCard) || []
  const doneCount = realCards.filter(c => !!c.isDone).length
  const totalCount = realCards.length
  const columnProgress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  const hasAttachments = activeCard?.attachments && activeCard.attachments.length > 0
  const showDeliverableWarning = isDone && !hasAttachments

  // Màu progress bar column
  const progressColor = columnProgress === 100 ? '#27ae60'
    : columnProgress >= 75 ? '#2ecc71'
      : columnProgress >= 50 ? '#f39c12'
        : columnProgress >= 25 ? '#3498db'
          : '#95a5a6'

  // Toggle done/undone cho card
  const onToggleCardDone = async () => {
    await callApiUpdateCard({ isDone: !isDone })
    // Cập nhật lại board để column progress tự tính lại
    const newBoard = cloneDeep(board)
    const columnToUpdate = newBoard.columns?.find(c => c._id === activeCard?.columnId)
    if (columnToUpdate) {
      const cardToUpdate = columnToUpdate.cards?.find(c => c._id === activeCard?._id)
      if (cardToUpdate) cardToUpdate.isDone = !isDone
    }
    dispatch(updateCurrentActiveBoard(newBoard))
    toast.success(!isDone ? '✔ Card marked as done!' : 'Card marked as in-progress', { position: 'bottom-right' })
  }


  return (
    <>
      <Modal
        disableScrollLock
        open={isShowModalActiveCard}
        onClose={handleCloseModal} // Sử dụng onClose trong trường hợp muốn đóng Modal bằng nút ESC hoặc click ra ngoài Modal
        sx={{ overflowY: 'auto' }}>
        <Box sx={{
          position: 'relative',
          width: 900,
          maxWidth: 900,
          bgcolor: 'white',
          boxShadow: 24,
          borderRadius: '8px',
          border: 'none',
          outline: 0,
          padding: '40px 20px 20px',
          margin: '50px auto',
          backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#1A2027' : '#fff'
        }}>
          <Box sx={{
            position: 'absolute',
            top: '12px',
            right: '10px',
            cursor: 'pointer'
          }}>
            <CancelIcon color="error" sx={{ '&:hover': { color: 'error.light' } }} onClick={handleCloseModal} />
          </Box>

          {activeCard?.cover &&
          <Box sx={{ mb: 4 }}>
            <img
              style={{ width: '100%', height: '320px', borderRadius: '6px', objectFit: 'cover' }}
              src={activeCard?.cover}
              alt="card-cover"
            />
          </Box>
          }

          <Box sx={{ mb: 1, mt: -3, pr: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <CreditCardIcon />

            {/* Feature 01: Xử lý tiêu đề của Card */}
            <ToggleFocusInput
              inputFontSize='22px'
              value={activeCard?.title}
              onChangedValue={onUpdateCardTitle} />
          </Box>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            {/* Left side */}
            <Grid xs={12} sm={9}>
              <Box sx={{ display: 'flex', gap: 4, mb: 3 }}>
                <Box>
                  <Typography sx={{ fontWeight: '600', color: 'primary.main', mb: 1 }}>Owner</Typography>
                  {cardOwner ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar src={cardOwner.avatar} alt={cardOwner.displayName} sx={{ width: 32, height: 32 }} />
                      <Typography variant="body2" sx={{ fontWeight: '500' }}>{cardOwner.displayName}</Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">No owner</Typography>
                  )}
                </Box>

                <Box>
                  <Typography sx={{ fontWeight: '600', color: 'primary.main', mb: 1 }}>Members</Typography>

                  {/* Feature 02: Xử lý các thành viên của Card */}
                  <CardUserGroup
                    cardMemberIds={activeCard?.memberIds}
                    cardOwnerIds={activeCard?.ownerIds}
                    onUpdateCardMembers={onUpdateCardMembers}
                  />
                </Box>

                {/* Deadline Display Block */}
                {activeCard?.deadline && (
                  <Box>
                    <Typography sx={{ fontWeight: '600', color: 'primary.main', mb: 1 }}>Due Date</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Checkbox
                        checked={!!activeCard.isDone}
                        onChange={onToggleCardDone}
                        size="small"
                        sx={{ p: 0 }}
                      />
                      <Box
                        sx={{
                          px: 1, py: 0.25, borderRadius: '4px', fontSize: '12px', fontWeight: 500,
                          bgcolor: (theme) => theme.palette.mode === 'dark' ? '#2c3e50' : '#f4f5f7',
                          border: '1px solid',
                          borderColor: 'divider',
                          cursor: 'pointer',
                          '&:hover': { bgcolor: (theme) => theme.palette.mode === 'dark' ? '#3c5a7a' : '#e0e0e0' }
                        }}
                        onClick={handleOpenDatePicker}
                      >
                        {moment(activeCard.deadline).format('DD/MM/YYYY HH:mm')}
                      </Box>
                      {getDeadlineBadge()}
                    </Box>
                  </Box>
                )}
              </Box>

              {/* Task Progress Section — hiển thị tiến trình thực tế của column */}
              <Box sx={{
                mb: 3, p: 2, borderRadius: '8px',
                bgcolor: isDone
                  ? (theme) => theme.palette.mode === 'dark' ? 'rgba(39,174,96,0.12)' : 'rgba(39,174,96,0.07)'
                  : (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                border: '1px solid',
                borderColor: isDone ? '#27ae60' : (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'
              }}>
                {/* Dòng 1: Tiêu đề và trạng thái card này */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {isDone
                      ? <CheckCircleIcon sx={{ fontSize: '18px', color: '#27ae60' }} />
                      : <SpeedIcon sx={{ fontSize: '18px', color: 'primary.main' }} />
                    }
                    <Typography sx={{ fontWeight: '600', fontSize: '14px' }}>Task Progress</Typography>
                  </Box>
                  {/* Chip trạng thái card hiện tại */}
                  <Box
                    sx={{
                      px: 1.5, py: 0.25, borderRadius: '12px',
                      bgcolor: isDone ? '#27ae60' : '#95a5a6',
                      color: '#fff', fontSize: '12px', fontWeight: 700
                    }}
                  >
                    {isDone ? 'Done ✔' : 'In Progress'}
                  </Box>
                </Box>

                {/* Dòng 2: Tiến trình tổng của column */}
                <Box sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '11px' }}>
                    Column progress: {doneCount}/{totalCount} cards done
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '13px', color: progressColor }}>
                      {columnProgress}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={columnProgress}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
                      '& .MuiLinearProgress-bar': { borderRadius: 5, bgcolor: progressColor }
                    }}
                  />
                </Box>
              </Box>


              {/* Deliverables Warning — hiển thị khi Done nhưng chưa upload file */}
              {showDeliverableWarning && (
                <Alert
                  severity="warning"
                  icon={<WarningAmberIcon fontSize="small" />}
                  sx={{ mb: 2, borderRadius: '8px', fontSize: '13px' }}
                >
                  <strong>Task completed but no deliverables uploaded.</strong>
                  <br />
                  <span style={{ fontSize: '12px' }}>Please upload your work output (PDF, document, source code…) to this card.</span>
                </Alert>
              )}

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <SubjectRoundedIcon />
                  <Typography variant="span" sx={{ fontWeight: '600', fontSize: '20px' }}>Description</Typography>
                </Box>

                {/* Feature 03: Xử lý mô tả của Card */}
                <CardDescriptionMdEditor
                  cardDescriptionProp={activeCard?.description}
                  handleUpdateCardDescription={onUpdateCardDescription}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <DvrOutlinedIcon />
                  <Typography variant="span" sx={{ fontWeight: '600', fontSize: '20px' }}>Activity</Typography>
                </Box>

                {/* Feature 04: Xử lý các hành động, ví dụ comment vào Card */}
                <CardActivitySection
                  cardComments={activeCard?.comments}
                  onAddCardComment={onAddCardComment}
                  onUpdateCardComment={onUpdateCardComment}
                  onDeleteCardComment={onDeleteCardComment}
                />
              </Box>

              {/* Feature 05b: Deliverables / Attachments
                Khi progress = 100 (Done): hiển thị nổi bật dưới dạng "sản phẩm bàn giao" */}
              <Box
                sx={{
                  mt: 1,
                  ...(isDone && {
                    p: 2,
                    borderRadius: '10px',
                    border: '2px solid #27ae60',
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(39,174,96,0.08)' : 'rgba(39,174,96,0.04)'
                  })
                }}
              >
                {isDone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: hasAttachments ? 1.5 : 0.5 }}>
                    <EmojiEventsOutlinedIcon sx={{ color: '#27ae60', fontSize: '20px' }} />
                    <Typography sx={{ fontWeight: 700, fontSize: '15px', color: '#27ae60' }}>
                    Deliverables
                    </Typography>
                    {hasAttachments && (
                      <Box sx={{
                        ml: 'auto', px: 1, py: 0.25, borderRadius: '10px',
                        bgcolor: '#27ae60', color: '#fff', fontSize: '11px', fontWeight: 700
                      }}>
                        {activeCard.attachments.length} file{activeCard.attachments.length > 1 ? 's' : ''}
                      </Box>
                    )}
                  </Box>
                )}
                <CardAttachmentSection
                  attachments={activeCard?.attachments}
                  onUploadAttachments={onUploadAttachments}
                  onRemoveAttachment={onRemoveAttachment}
                  isUploadingAttachment={isUploadingAttachment}
                />
                {isDone && !hasAttachments && (
                  <Typography variant="caption" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                  No deliverables uploaded yet.
                  </Typography>
                )}
              </Box>
            </Grid>

            {/* Right side */}
            <Grid xs={12} sm={3}>
              <Typography sx={{ fontWeight: '600', color: 'primary.main', mb: 1 }}>Add To Card</Typography>
              <Stack direction="column" spacing={1}>

                {/* Feature 05: Xử lý hành động bản thân user tự join vào card */}
                {!activeCard?.ownerIds?.includes(currentUser._id) && (
                  <>
                    {!activeCard?.memberIds?.includes(currentUser._id) ? (
                      <SidebarItem
                        className="active"
                        onClick={() => onUpdateCardMembers({
                          userId: currentUser._id,
                          action: CARD_MEMBER_ACTIONS.ADD
                        })}
                      >
                        <PersonOutlineOutlinedIcon fontSize="small" />
                      Join
                      </SidebarItem>
                    ) : (
                      <SidebarItem
                        className="active"
                        onClick={() => onUpdateCardMembers({
                          userId: currentUser._id,
                          action: CARD_MEMBER_ACTIONS.REMOVE
                        })}
                      >
                        <PersonRemoveIcon fontSize="small" />
                      Leave
                      </SidebarItem>
                    )}
                  </>
                )}

                {/* Mark Done / Undo Done — nút chính đánh dấu tiến trình */}
                <SidebarItem
                  className="active"
                  onClick={onToggleCardDone}
                  sx={{
                    color: isDone ? '#27ae60' : 'inherit',
                    bgcolor: isDone
                      ? (theme) => theme.palette.mode === 'dark' ? 'rgba(39,174,96,0.18)' : 'rgba(39,174,96,0.12)'
                      : undefined,
                    border: isDone ? '1px solid #27ae60' : '1px solid transparent',
                    '&:hover': {
                      bgcolor: isDone
                        ? (theme) => theme.palette.mode === 'dark' ? 'rgba(39,174,96,0.28)' : 'rgba(39,174,96,0.20)'
                        : undefined
                    }
                  }}
                >
                  {isDone
                    ? <CheckCircleIcon fontSize="small" sx={{ color: '#27ae60' }} />
                    : <RadioButtonUncheckedIcon fontSize="small" />
                  }
                  {isDone ? 'Undo Done' : 'Mark as Done'}
                </SidebarItem>

                {/* Feature 06: Xử lý hành động cập nhật ảnh Cover của Card */}
                <SidebarItem className="active" component="label">
                  <ImageOutlinedIcon fontSize="small" />
                Cover
                  <VisuallyHiddenInput type="file" onChange={onUploadCardCover} />
                </SidebarItem>

                {/* Feature 07: Attachment - Upload files, images, folders từ máy local */}
                <SidebarItem
                  className="active"
                  component="label"
                  sx={{ position: 'relative' }}
                >
                  <AttachFileOutlinedIcon fontSize="small" />
                Attachment
                  {isUploadingAttachment && (
                    <Box component="span" sx={{
                      ml: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '11px',
                      color: 'primary.main'
                    }}>
                    ...
                    </Box>
                  )}
                  {/* Input ẩn hỗ trợ chọn nhiều file VÀ cả folder */}
                  <VisuallyHiddenInput
                    type="file"
                    multiple
                    onChange={onUploadAttachments}
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.7z,.txt,.csv"
                  />
                </SidebarItem>
                <SidebarItem><LocalOfferOutlinedIcon fontSize="small" />Labels</SidebarItem>
                <SidebarItem><TaskAltOutlinedIcon fontSize="small" />Checklist</SidebarItem>
                <SidebarItem onClick={handleOpenDatePicker}><WatchLaterOutlinedIcon fontSize="small" />Dates</SidebarItem>
                {(activeCard?.ownerIds?.includes(currentUser._id) || board?.ownerIds?.includes(currentUser._id)) &&
                <SidebarItem onClick={handleDeleteCard}>
                  <DeleteIcon fontSize="small" />
                  Delete card
                </SidebarItem>
                }
              </Stack>

              {/* <Divider sx={{ my: 2 }} />

            <Typography sx={{ fontWeight: '600', color: 'primary.main', mb: 1 }}>Power-Ups</Typography>
            <Stack direction="column" spacing={1}>
              <SidebarItem><AspectRatioOutlinedIcon fontSize="small" />Card Size</SidebarItem>
              <SidebarItem><AddToDriveOutlinedIcon fontSize="small" />Google Drive</SidebarItem>
              <SidebarItem><AddOutlinedIcon fontSize="small" />Add Power-Ups</SidebarItem>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography sx={{ fontWeight: '600', color: 'primary.main', mb: 1 }}>Actions</Typography>
            <Stack direction="column" spacing={1}>
              <SidebarItem><ArrowForwardOutlinedIcon fontSize="small" />Move</SidebarItem>
              <SidebarItem><ContentCopyOutlinedIcon fontSize="small" />Copy</SidebarItem>
              <SidebarItem><AutoAwesomeOutlinedIcon fontSize="small" />Make Template</SidebarItem>
              <SidebarItem><ArchiveOutlinedIcon fontSize="small" />Archive</SidebarItem>
              <SidebarItem><ShareOutlinedIcon fontSize="small" />Share</SidebarItem>
            </Stack> */}
            </Grid>
          </Grid>
        </Box>
      </Modal>

      {/* Popover chọn ngày giờ Deadline */}
      <Popover
        open={Boolean(dateAnchorEl)}
        anchorEl={dateAnchorEl}
        onClose={handleCloseDatePicker}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, width: 280 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>Set Deadline</Typography>
          <TextField
            type="datetime-local"
            size="small"
            fullWidth
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            inputProps={{ min: moment().format('YYYY-MM-DDTHH:mm') }}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" size="small" onClick={handleSaveDeadline} fullWidth>
            Save
            </Button>
            {activeCard?.deadline && (
              <Button variant="outlined" color="error" size="small" onClick={handleRemoveDeadline} fullWidth>
              Remove
              </Button>
            )}
          </Box>
        </Box>
      </Popover>
    </>
  )
}

export default ActiveCard
