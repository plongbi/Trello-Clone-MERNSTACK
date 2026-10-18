import { useState, useRef, useEffect } from 'react'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import SendIcon from '@mui/icons-material/Send'
import CircularProgress from '@mui/material/CircularProgress'
import CloseIcon from '@mui/icons-material/Close'
import SupportAgentIcon from '@mui/icons-material/SupportAgent'
import { chatBotAPI } from '~/apis'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'

function ChatBox({ onClose }) {
  const currentUser = useSelector(selectCurrentUser)

  const [messages, setMessages] = useState(() => {
    if (currentUser) {
      const saved = localStorage.getItem(`chatbot_history_${currentUser._id}`)
      if (saved) {
        return JSON.parse(saved)
      }
    }
    return [
      { role: 'assistant', content: 'How can I help you?' }
    ]
  })
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [dimensions, setDimensions] = useState({ width: 400, height: 500 })

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
    if (currentUser) {
      localStorage.setItem(`chatbot_history_${currentUser._id}`, JSON.stringify(messages))
    }
  }, [messages, currentUser])

  const handleMouseDown = (e) => {
    e.preventDefault()

    const startX = e.clientX
    const startY = e.clientY
    const startWidth = dimensions.width
    const startHeight = dimensions.height

    const handleMouseMove = (moveEvent) => {
      const newWidth = startWidth - (moveEvent.clientX - startX)
      const newHeight = startHeight - (moveEvent.clientY - startY)

      setDimensions({
        width: Math.max(300, Math.min(newWidth, window.innerWidth - 50)),
        height: Math.max(400, Math.min(newHeight, window.innerHeight - 100))
      })
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage = { role: 'user', content: inputValue }
    const newChatHistory = [...messages, userMessage]

    setMessages(newChatHistory)
    setInputValue('')
    setIsLoading(true)

    try {
      // TỐI ƯU: Chỉ gửi 10 tin nhắn cuối cùng để tránh vượt quá giới hạn token của OpenAI
      const limitedHistory = newChatHistory.slice(-10)

      const response = await chatBotAPI({ messages: limitedHistory })

      const botMessage = { role: 'assistant', content: response.reply }
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Lỗi gọi API ChatBot:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'The system is overloaded, please wait a few seconds and try again!'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <Paper
      elevation={3}
      sx={{
        width: dimensions.width,
        height: dimensions.height,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        transition: 'none',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
      }}
    >
      <Box
        onMouseDown={handleMouseDown}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 40,
          height: 40,
          cursor: 'nwse-resize',
          zIndex: 9999,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 8,
            left: 8,
            width: 12,
            height: 12,
            borderTop: '3px solid white',
            borderLeft: '3px solid white'
          }
        }}
      />

      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: 'primary.main',
        color: 'white',
        p: 1,
        px: 2,
        pl: 5
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SupportAgentIcon fontSize="small" />
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>AI Assistant</Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, p: 2, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
        {messages.map((msg, index) => (
          <Box key={index} sx={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <Paper
              elevation={1}
              sx={{
                p: 1.5,
                maxWidth: '85%',
                bgcolor: msg.role === 'user' ? 'primary.main' : (theme) => theme.palette.mode === 'dark' ? '#33485D' : '#f1f2f6',
                color: msg.role === 'user' ? 'white' : 'text.primary',
                borderRadius: msg.role === 'user' ? '20px 20px 0 20px' : '20px 20px 20px 0'
              }}
            >
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{msg.content}</Typography>
            </Paper>
          </Box>
        ))}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            <Paper
              elevation={1}
              sx={{
                p: 1.5,
                bgcolor: (theme) => theme.palette.mode === 'dark' ? '#33485D' : '#f1f2f6',
                borderRadius: '20px 20px 20px 0'
              }}
            >
              <CircularProgress size={20} color="inherit" />
            </Paper>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      <Box sx={{ p: 1, display: 'flex', alignItems: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
        <TextField fullWidth size="small" placeholder="Ask AI..." variant="outlined" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} disabled={isLoading} multiline maxRows={3} />
        <IconButton color="primary" onClick={handleSendMessage} disabled={!inputValue.trim() || isLoading} sx={{ ml: 1 }}><SendIcon /></IconButton>
      </Box>
    </Paper>
  )
}

export default ChatBox