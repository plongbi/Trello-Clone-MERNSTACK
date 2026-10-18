import { useEffect, useState, useMemo } from 'react'
import moment from 'moment'
import Badge from '@mui/material/Badge'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import Avatar from '@mui/material/Avatar'
import CircularProgress from '@mui/material/CircularProgress'
import GroupAddIcon from '@mui/icons-material/GroupAdd'
import CommentIcon from '@mui/icons-material/Comment'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import DoneIcon from '@mui/icons-material/Done'
import NotInterestedIcon from '@mui/icons-material/NotInterested'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchInvitationsAPI,
  fetchCardNotificationsAPI,
  updateBoardInvitationAPI,
  markNotificationAsReadAPI,
  markAllNotificationsAsReadAPI,
  selectCurrentNotifications,
  selectCardNotifications,
  selectUnreadCardCount,
  addNotification,
  addCardNotification
} from '~/redux/notifications/notificationsSlice'
import { socketIoInstance } from '~/socketClient'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { fetchBoardDetailsAPI } from '~/redux/activeBoard/activeBoardSlice'
import { updateCurrentActiveCard, showModalActiveCard } from '~/redux/activeCard/activeCardSlice'

const BOARD_INVITATION_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED'
}

// Icon tương ứng theo loại thông báo thẻ
const CARD_NOTIFICATION_ICON = {
  CARD_COMMENTED: <CommentIcon fontSize="small" sx={{ color: '#4facfe' }} />,
  CARD_MEMBER_ADDED: <PersonAddIcon fontSize="small" sx={{ color: '#43e97b' }} />
}

function Notifications() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [anchorEl, setAnchorEl] = useState(null)
  const [loadingInvitations, setLoadingInvitations] = useState(false)
  const open = Boolean(anchorEl)

  const currentUser = useSelector(selectCurrentUser)
  const invitations = useSelector(selectCurrentNotifications)
  const cardNotifications = useSelector(selectCardNotifications)
  const unreadCardCount = useSelector(selectUnreadCardCount)

  // Số thông báo chưa xử lý (invitations PENDING + card chưa đọc)
  const pendingInvitationsCount = useMemo(
    () => (invitations || []).filter(n => n.boardInvitation?.status === BOARD_INVITATION_STATUS.PENDING).length,
    [invitations]
  )
  const totalUnread = pendingInvitationsCount + unreadCardCount

  // Fetch cả 2 nguồn khi mount
  useEffect(() => {
    // Join vào room cá nhân để nhận thông báo realtime theo userId
    socketIoInstance.emit('joinUserRoom', currentUser._id)

    setLoadingInvitations(true)
    Promise.all([
      dispatch(fetchInvitationsAPI()),
      dispatch(fetchCardNotificationsAPI())
    ]).finally(() => setLoadingInvitations(false))

    // Lắng nghe lời mời Board (đã có sẵn)
    const onReceiveInvitation = (invitation) => {
      if (invitation.inviteeId === currentUser._id) {
        dispatch(addNotification(invitation))
        toast.info(`🎉 You have been invited to Board "${invitation.board?.title}"`)
      }
    }

    // Lắng nghe thông báo thẻ mới (MỚI)
    const onReceiveCardNotification = (notification) => {
      dispatch(addCardNotification(notification))
      toast.info(`🔔 ${notification.message}`, { autoClose: 4000 })
    }

    socketIoInstance.on('BE_USER_INVITED_TO_BOARD', onReceiveInvitation)
    socketIoInstance.on('BE_NEW_NOTIFICATION', onReceiveCardNotification)

    return () => {
      socketIoInstance.off('BE_USER_INVITED_TO_BOARD', onReceiveInvitation)
      socketIoInstance.off('BE_NEW_NOTIFICATION', onReceiveCardNotification)
      socketIoInstance.emit('leaveUserRoom', currentUser._id)
    }
  }, [dispatch, currentUser._id])

  const handleOpenMenu = (event) => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)

  // Xử lý Accept/Reject lời mời Board
  const handleUpdateBoardInvitation = (status, invitationId) => {
    dispatch(updateBoardInvitationAPI({ status, invitationId })).then(res => {
      if (res.payload?.boardInvitation?.status === BOARD_INVITATION_STATUS.ACCEPTED) {
        setTimeout(() => navigate(`/boards/${res.payload.boardInvitation.boardId}`), 600)
      }
    })
  }

  // Click vào thông báo thẻ: đánh dấu đã đọc + điều hướng tới Board + mở modal thẻ
  const handleClickCardNotification = (notification) => {
    if (!notification.isRead) {
      dispatch(markNotificationAsReadAPI(notification._id))
    }
    handleClose()

    // Tải thông tin chi tiết Board mới nhất để có thẻ mới, sau đó mở modal Active Card
    dispatch(fetchBoardDetailsAPI(notification.boardId)).then((res) => {
      const board = res.payload
      if (board && board.columns) {
        let card = null
        for (const column of board.columns) {
          const found = column.cards?.find(c => c._id === notification.cardId)
          if (found) {
            card = found
            break
          }
        }
        if (card) {
          dispatch(updateCurrentActiveCard(card))
          dispatch(showModalActiveCard())
        }
      }
    })

    navigate(`/boards/${notification.boardId}`)
  }

  // Đánh dấu tất cả thông báo thẻ đã đọc
  const handleMarkAllRead = (e) => {
    e.stopPropagation()
    if (unreadCardCount > 0) dispatch(markAllNotificationsAsReadAPI())
  }

  const hasNoData = (!invitations || invitations.length === 0) && cardNotifications.length === 0

  return (
    <Box>
      <Tooltip title="Notifications">
        <Badge
          badgeContent={totalUnread > 0 ? totalUnread : null}
          color="error"
          sx={{ cursor: 'pointer' }}
          id="basic-button-open-notification"
          aria-controls={open ? 'basic-notification-drop-down' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleOpenMenu}
        >
          <NotificationsNoneIcon sx={{ color: totalUnread > 0 ? 'yellow' : 'white' }} />
        </Badge>
      </Tooltip>

      <Menu
        sx={{ mt: 2 }}
        id="basic-notification-drop-down"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 8,
          sx: { borderRadius: 3, minWidth: 340, maxWidth: 400, border: '1px solid', borderColor: 'divider' }
        }}
        MenuListProps={{ 'aria-labelledby': 'basic-button-open-notification', disablePadding: true }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Header */}
        <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" fontWeight={700}>Notifications</Typography>
          {unreadCardCount > 0 && (
            <Tooltip title="Mark all as read">
              <Box onClick={handleMarkAllRead} sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5, color: 'primary.main', '&:hover': { opacity: 0.7 } }}>
                <DoneAllIcon fontSize="small" />
                <Typography variant="caption" fontWeight={600}>Mark all read</Typography>
              </Box>
            </Tooltip>
          )}
        </Box>

        {/* Trạng thái loading */}
        {loadingInvitations && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {/* Không có thông báo nào */}
        {!loadingInvitations && hasNoData && (
          <Box sx={{ px: 2, py: 4, textAlign: 'center', opacity: 0.5 }}>
            <NotificationsNoneIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="body2">No notifications yet</Typography>
          </Box>
        )}

        {/* ── PHẦN 1: Lời mời tham gia Board ── */}
        {!loadingInvitations && invitations && invitations.length > 0 && (
          <Box>
            <Box sx={{ px: 2, py: 0.75 }}>
              <Typography variant="caption" fontWeight={700} sx={{ opacity: 0.5, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                Board Invitations
              </Typography>
            </Box>
            {invitations.map((notification, index) => (
              <Box key={notification._id || index}>
                <MenuItem sx={{ py: 1.25, px: 2, alignItems: 'flex-start', gap: 1.5 }}>
                  <GroupAddIcon sx={{ mt: 0.25, flexShrink: 0, color: 'primary.main' }} fontSize="small" />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
                      <strong>{notification.inviter?.[0]?.displayName || 'Someone'}</strong>{' '}invited you to board{' '}
                      <strong>{notification.board?.[0]?.title}</strong>
                    </Typography>

                    {/* Nút Accept / Reject */}
                    {notification.boardInvitation?.status === BOARD_INVITATION_STATUS.PENDING && (
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.75 }}>
                        <Button size="small" variant="contained" color="success"
                          onClick={() => handleUpdateBoardInvitation(BOARD_INVITATION_STATUS.ACCEPTED, notification._id)}>
                          Accept
                        </Button>
                        <Button size="small" variant="outlined" color="error"
                          onClick={() => handleUpdateBoardInvitation(BOARD_INVITATION_STATUS.REJECTED, notification._id)}>
                          Decline
                        </Button>
                      </Box>
                    )}

                    {/* Trạng thái đã xử lý */}
                    <Box sx={{ mt: 0.5 }}>
                      {notification.boardInvitation?.status === BOARD_INVITATION_STATUS.ACCEPTED && (
                        <Chip icon={<DoneIcon />} label="Accepted" color="success" size="small" />
                      )}
                      {notification.boardInvitation?.status === BOARD_INVITATION_STATUS.REJECTED && (
                        <Chip icon={<NotInterestedIcon />} label="Declined" size="small" />
                      )}
                    </Box>

                    <Typography variant="caption" sx={{ opacity: 0.45, display: 'block', mt: 0.5 }}>
                      {moment(notification.createdAt).fromNow()}
                    </Typography>
                  </Box>
                </MenuItem>
                {index !== invitations.length - 1 && <Divider />}
              </Box>
            ))}
          </Box>
        )}

        {/* Divider giữa 2 khu vực */}
        {!loadingInvitations && invitations?.length > 0 && cardNotifications.length > 0 && <Divider />}

        {/* ── PHẦN 2: Thông báo hoạt động thẻ ── */}
        {!loadingInvitations && cardNotifications.length > 0 && (
          <Box>
            <Box sx={{ px: 2, py: 0.75 }}>
              <Typography variant="caption" fontWeight={700} sx={{ opacity: 0.5, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                Card Activity
              </Typography>
            </Box>
            {cardNotifications.slice(0, 15).map((notification, index) => (
              <Box key={notification._id || index}>
                <MenuItem
                  onClick={() => handleClickCardNotification(notification)}
                  sx={{
                    py: 1.25, px: 2, alignItems: 'flex-start', gap: 1.5,
                    bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                    '&:hover': { bgcolor: 'action.selected' }
                  }}
                >
                  {/* Avatar người gửi */}
                  <Avatar
                    src={notification.sender?.avatar}
                    sx={{ width: 32, height: 32, flexShrink: 0, mt: 0.25, fontSize: 13 }}
                  >
                    {notification.sender?.displayName?.charAt(0).toUpperCase()}
                  </Avatar>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
                      {CARD_NOTIFICATION_ICON[notification.type]}
                      <Typography variant="body2" sx={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
                        {notification.message}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ opacity: 0.45 }}>
                      {moment(notification.createdAt).fromNow()}
                    </Typography>
                  </Box>

                  {/* Chấm tròn xanh = chưa đọc */}
                  {!notification.isRead && (
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4facfe', flexShrink: 0, mt: 0.75 }} />
                  )}
                </MenuItem>
                {index !== cardNotifications.slice(0, 15).length - 1 && <Divider />}
              </Box>
            ))}
          </Box>
        )}

        <Box sx={{ height: 4 }} />
      </Menu>
    </Box>
  )
}

export default Notifications

