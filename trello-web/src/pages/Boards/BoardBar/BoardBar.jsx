import { useState } from 'react'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import DashboardIcon from '@mui/icons-material/Dashboard'
import VpnLockIcon from '@mui/icons-material/VpnLock'
import AddToDriveIcon from '@mui/icons-material/AddToDrive'
import BoltIcon from '@mui/icons-material/Bolt'
import FilterListIcon from '@mui/icons-material/FilterList'
import Tooltip from '@mui/material/Tooltip'
import Badge from '@mui/material/Badge'
import { capitalizeFirstLetter } from '~/utils/formatters'
import BoardUserGroup from './BoardUserGroup'
import InviteBoardUser from './InviteBoardUser'
import SupportAgentIcon from '@mui/icons-material/SupportAgent'
import CloseIcon from '@mui/icons-material/Close'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import ChatIcon from '@mui/icons-material/Chat'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { selectUnreadConversationIds } from '~/redux/chat/chatSlice'
import { selectCurrentUser } from '~/redux/user/userSlice'

// Nhớ import file ChatBox, hãy điều chỉnh lại đường dẫn nếu cần thiết
import ChatBox from '~/components/ChatBot/ChatBox'

const MENU_STYLES = {
  color: 'white',
  bgcolor: 'transparent',
  border: 'none',
  paddingX: '5px',
  borderRadius: '4px',
  '.MuiSvgIcon-root': {
    color: 'white'
  },
  '&:hover': {
    bgcolor: 'rgba(255, 255, 255, 0.2)'
  }
}

function BoardBar({ board }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)
  const unreadConversationIds = useSelector(selectUnreadConversationIds)
  const hasUnreadChat = unreadConversationIds.length > 0

  // State quản lý việc mở/đóng cửa sổ chat
  const [isOpenChat, setIsOpenChat] = useState(false)

  return (
    <>
      <Box sx={{
        width: '100%',
        height: (theme) => theme.trello.boardBarHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        paddingX: 2,
        overflowX: 'auto',
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e' : '#1976d2'),
        '&::-webkit-scrollbar-track': { m: 2 }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title={board?.description}>
            <Chip
              sx={MENU_STYLES}
              icon={<DashboardIcon />} label={board?.title} clickable />
          </Tooltip>

          {board?.owners && board.owners.length > 0 && (
            <Tooltip title={`Owner: ${board.owners[0].displayName}`}>
              <Avatar
                src={board.owners[0].avatar}
                alt={board.owners[0].displayName}
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                {board.owners[0].displayName.charAt(0)}
              </Avatar>
            </Tooltip>
          )}

          <Chip
            sx={MENU_STYLES}
            icon={<VpnLockIcon />} label={capitalizeFirstLetter(board?.type)} clickable />

          <Chip
            sx={MENU_STYLES}
            icon={<SupportAgentIcon />}
            label="Chat bot"
            clickable
            onClick={() => setIsOpenChat(!isOpenChat)}
          />

          <Badge color="error" variant="dot" invisible={!hasUnreadChat}>
            <Chip
              sx={MENU_STYLES}
              icon={<ChatIcon />}
              label="Chatting"
              clickable
              onClick={() => {
                navigate(`/boards/${board._id}/chat`)
              }}
            />
          </Badge>

          {/* <Chip
            sx={MENU_STYLES}
            icon={<BoltIcon />} label="Automation" clickable />
          <Chip
            sx={MENU_STYLES}
            icon={<FilterListIcon />} label="Filters" clickable /> */}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Xử lý mời user là member của board */}
          <InviteBoardUser boardId={board._id} />

          {/* Xử lý hiển thị ds thành viên của board */}
          <BoardUserGroup boardUsers={board?.FE_allUsers} />
        </Box>
      </Box>

      {/* Pop-up cửa sổ chat AI */}
      {isOpenChat && (
        <Box sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 9999
        }}>
          {/* Chỉ cần gọi ChatBox ở đây, KHÔNG bọc thêm Paper hay Box Header nào nữa */}
          <ChatBox onClose={() => setIsOpenChat(false)} />
        </Box>
      )}
    </>
  )
}

export default BoardBar