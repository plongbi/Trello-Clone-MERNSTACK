import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import Tooltip from '@mui/material/Tooltip'
import Badge from '@mui/material/Badge'
import Divider from '@mui/material/Divider'
import SendIcon from '@mui/icons-material/Send'
import GroupAddIcon from '@mui/icons-material/GroupAdd'
import InfoIcon from '@mui/icons-material/InfoOutlined'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Checkbox from '@mui/material/Checkbox'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import { io } from 'socket.io-client'

import AppBar from '~/components/AppBar/AppBar'
import PageLoadingSpinner from '~/components/Loading/PageLoadingSpinner'
import { fetchBoardDetailsAPI, selectCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { selectUnreadConversationIds, removeUnreadConversation } from '~/redux/chat/chatSlice'
import { API_ROOT } from '~/utils/constants'
import {
  fetchConversationsAPI,
  createNewConversationAPI,
  fetchMessagesAPI,
  createNewMessageAPI
} from '~/apis'

function BoardChat() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { boardId } = useParams()

  const board = useSelector(selectCurrentActiveBoard)
  const currentUser = useSelector(selectCurrentUser)
  const unreadConversationIds = useSelector(selectUnreadConversationIds)

  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [socket, setSocket] = useState(null)
  const [openCreateGroup, setOpenCreateGroup] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [selectedMembers, setSelectedMembers] = useState([])

  const messagesEndRef = useRef(null)

  // Fetch Board details on mount to ensure we have the latest member list
  useEffect(() => {
    dispatch(fetchBoardDetailsAPI(boardId))
  }, [boardId, dispatch])

  // Init Socket
  useEffect(() => {
    const newSocket = io(API_ROOT) // API_ROOT corresponds to the backend URL
    setSocket(newSocket)

    return () => newSocket.close()
  }, [])

  // Fetch Conversations
  useEffect(() => {
    if (board && currentUser) {
      fetchConversationsAPI(board._id).then(data => {
        setConversations(data)
      })
    }
  }, [board, currentUser])

  // Handle Socket Events for active conversation
  useEffect(() => {
    if (socket && activeConversation) {
      socket.emit('join_conversation', activeConversation._id)

      socket.on('receive_message', (message) => {
        if (message.conversationId === activeConversation._id) {
          setMessages(prev => [...prev, message])
        }
      })

      return () => {
        socket.emit('leave_conversation', activeConversation._id)
        socket.off('receive_message')
      }
    }
  }, [socket, activeConversation])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Mark active conversation as read
  useEffect(() => {
    if (activeConversation && unreadConversationIds.includes(activeConversation._id)) {
      dispatch(removeUnreadConversation(activeConversation._id))
    }
  }, [unreadConversationIds, activeConversation, dispatch])

  const handleSelectConversation = (conversation) => {
    setActiveConversation(conversation)
    dispatch(removeUnreadConversation(conversation._id))
    fetchMessagesAPI(conversation._id).then(data => {
      setMessages(data)
    })
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeConversation) return

    const messageData = {
      conversationId: activeConversation._id,
      content: newMessage.trim()
    }

    try {
      const createdMessage = await createNewMessageAPI(messageData)
      socket.emit('send_message', { message: createdMessage, memberIds: activeConversation.memberIds })
      setNewMessage('')
    } catch (error) {
      console.error(error)
    }
  }

  const handleCreateGroup = async () => {
    if (selectedMembers.length === 0) return

    const memberIds = [currentUser._id, ...selectedMembers]
    const type = selectedMembers.length === 1 ? 'PRIVATE' : 'GROUP'

    try {
      const newConv = await createNewConversationAPI({
        boardId: board._id,
        name: type === 'GROUP' ? newGroupName : null,
        type,
        memberIds
      })

      setConversations(prev => [newConv, ...prev])
      setOpenCreateGroup(false)
      setSelectedMembers([])
      setNewGroupName('')
      handleSelectConversation(newConv)
    } catch (error) {
      console.error(error)
    }
  }

  const handleToggleMember = (userId) => {
    setSelectedMembers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    )
  }

  if (!board) {
    return <PageLoadingSpinner caption="Loading Board..." />
  }

  return (
    <Container disableGutters maxWidth={false} sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar />

      {/* Board Header back button */}
      <Box sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={() => navigate(`/boards/${boardId}`)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ ml: 1 }}>Back to {board.title}</Typography>
      </Box>

      <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar */}
        <Box sx={{ width: 300, borderRight: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6">Chats</Typography>
            <IconButton onClick={() => setOpenCreateGroup(true)} color="primary">
              <GroupAddIcon />
            </IconButton>
          </Box>
          <List sx={{
            flexGrow: 1,
            overflowY: 'auto',
            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'inherit' : '#fff'
          }}>
            {conversations.map(conv => {
              let chatName = conv.name
              if (conv.type === 'PRIVATE') {
                // Find the other user
                const otherMemberId = conv.memberIds.find(id => id !== currentUser._id)
                const otherMember = board.FE_allUsers.find(u => u._id === otherMemberId)
                chatName = otherMember?.displayName || 'Unknown User'
              }

              return (
                <ListItem
                  button
                  key={conv._id}
                  onClick={() => handleSelectConversation(conv)}
                  selected={activeConversation?._id === conv._id}
                >
                  <ListItemAvatar>
                    <Badge color="error" variant="dot" invisible={!unreadConversationIds.includes(conv._id)}>
                      <Avatar>{chatName ? chatName.charAt(0).toUpperCase() : 'G'}</Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText primary={chatName} secondary={conv.type} sx={{
                    '& .MuiTypography-root': {
                      fontWeight: unreadConversationIds.includes(conv._id) ? 'bold' : 'normal'
                    }
                  }}/>
                </ListItem>
              )
            })}
            {conversations.length === 0 && (
              <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                No chats yet. Create one!
              </Typography>
            )}
          </List>
        </Box>

        {/* Message Area */}
        <Box sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: (theme) => theme.palette.mode === 'dark' ? '#2c3e50' : '#f5f5f5'
        }}>
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <Box sx={{
                p: 2,
                bgcolor: 'background.paper',
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: (theme) => theme.palette.mode === 'dark' ? 'none' : '0 2px 4px rgba(0,0,0,0.05)',
                zIndex: 1
              }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {activeConversation.type === 'GROUP'
                      ? activeConversation.name
                      : (
                        board.FE_allUsers.find(u => u._id === activeConversation.memberIds.find(id => id !== currentUser._id))?.displayName || 'Chat'
                      )
                    }
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: '#4caf50' }}></span>
                    {activeConversation.memberIds.length} {activeConversation.memberIds.length === 1 ? 'member' : 'members'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 32, height: 32, fontSize: '14px', border: (theme) => `2px solid ${theme.palette.background.paper}` } }}>
                    {activeConversation.memberIds.map(id => {
                      const member = board.FE_allUsers.find(u => u._id === id)
                      if (!member) return null
                      return (
                        <Tooltip key={member._id} title={member.displayName}>
                          <Avatar alt={member.displayName} src={member.avatar}>{member.displayName.charAt(0)}</Avatar>
                        </Tooltip>
                      )
                    })}
                  </AvatarGroup>
                  <IconButton>
                    <InfoIcon color="action" />
                  </IconButton>
                </Box>
              </Box>

              {/* Messages List */}
              <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
                {messages.map(msg => {
                  const isMe = msg.senderId === currentUser._id
                  const sender = board.FE_allUsers.find(u => u._id === msg.senderId)

                  return (
                    <Box key={msg._id} sx={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                      {!isMe && <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>{sender?.displayName}</Typography>}
                      <Box sx={{
                        bgcolor: isMe ? 'primary.main' : (theme) => theme.palette.mode === 'dark' ? '#34495e' : 'white',
                        color: isMe ? 'white' : 'text.primary',
                        p: 1.5,
                        borderRadius: 2,
                        boxShadow: 1
                      }}>
                        <Typography variant="body1">{msg.content}</Typography>
                      </Box>
                    </Box>
                  )
                })}
                <div ref={messagesEndRef} />
              </Box>

              {/* Chat Input */}
              <Box component="form" onSubmit={handleSendMessage} sx={{ p: 2, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <Button type="submit" variant="contained" color="primary" endIcon={<SendIcon />}>
                  Send
                </Button>
              </Box>
            </>
          ) : (
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="h5" color="text.secondary">Select a chat or create a new one</Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Create Group Modal */}
      <Dialog open={openCreateGroup} onClose={() => setOpenCreateGroup(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Chat</DialogTitle>
        <DialogContent dividers>
          {selectedMembers.length > 1 && (
            <TextField
              autoFocus
              margin="dense"
              label="Group Name"
              type="text"
              fullWidth
              variant="outlined"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              sx={{ mb: 2 }}
            />
          )}
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Select Members:</Typography>
          <FormGroup>
            {board.FE_allUsers.filter(u => u._id !== currentUser._id).map(user => (
              <FormControlLabel
                key={user._id}
                control={
                  <Checkbox
                    checked={selectedMembers.includes(user._id)}
                    onChange={() => handleToggleMember(user._id)}
                  />
                }
                label={user.displayName}
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateGroup(false)}>Cancel</Button>
          <Button
            onClick={handleCreateGroup}
            variant="contained"
            disabled={selectedMembers.length === 0 || (selectedMembers.length > 1 && !newGroupName.trim())}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default BoardChat
