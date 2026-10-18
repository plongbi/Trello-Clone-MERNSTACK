import { useEffect } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'

import Board from '~/pages/Boards/_id'
import NotFound from '~/pages/404/NotFound'
import Auth from '~/pages/Auth/Auth'
import AccountVerification from '~/pages/Auth/AccountVerification'
import { useDispatch, useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'
import Settings from '~/pages/Settings/Settings'
import Boards from '~/pages/Boards'
import BoardChat from '~/pages/Chat/Chat.jsx'
import { addUnreadConversation } from '~/redux/chat/chatSlice'
import { io } from 'socket.io-client'
import { API_ROOT } from '~/utils/constants'
import WorkspacesPage from '~/pages/Workspaces/WorkspacesPage'
import RecentPage from '~/pages/Recent/RecentPage'
import StarredPage from '~/pages/Starred/StarredPage'
import TemplatesPage from '~/pages/Templates/TemplatesPage'

const ProtectedRoute = ({ user }) => {
  if (!user) return <Navigate to='/login' replace={true} />
  return <Outlet />
}

function App() {
  const currentUser = useSelector(selectCurrentUser)
  const dispatch = useDispatch()

  // Global socket listener cho thông báo tin nhắn mới
  useEffect(() => {
    let socket = null
    if (currentUser) {
      socket = io(API_ROOT)
      socket.emit('join_user', currentUser._id)
      socket.on('new_message_notification', (message) => {
        if (message.senderId !== currentUser._id) {
          dispatch(addUnreadConversation(message.conversationId))
        }
      })
    }
    return () => {
      if (socket) socket.close()
    }
  }, [currentUser, dispatch])

  return (
    <Routes>
      {/* Redirect Route */}
      <Route path='/' element={
        // replace true để thay thế route / (route / không nằm trong history browser)
        <Navigate to="/boards" replace={true} />
      } />

      <Route element={<ProtectedRoute user={currentUser} />}>
        {/* Board Details */}
        <Route path='/boards/:boardId' element={<Board />} />
        <Route path='/boards/:boardId/chat' element={<BoardChat />} />
        <Route path='/boards' element={<Boards />} />

        {/* Navbar Feature Pages */}
        <Route path='/workspaces' element={<WorkspacesPage />} />
        <Route path='/recent' element={<RecentPage />} />
        <Route path='/starred' element={<StarredPage />} />
        <Route path='/templates' element={<TemplatesPage />} />

        {/* User Settings */}
        <Route path='/settings/account' element={<Settings />} />
        <Route path='/settings/security' element={<Settings />} />
      </Route>

      {/* Authentication */}
      <Route path='/login' element={<Auth />} />
      <Route path='/register' element={<Auth />} />
      <Route path='/account/verification' element={<AccountVerification />} />

      {/* 404 not found page */}
      <Route path='*' element={<NotFound />} />

    </Routes>
  )
}

export default App
