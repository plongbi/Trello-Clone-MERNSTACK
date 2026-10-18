import { toast } from 'react-toastify'
import authorizedAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'

// BOARD
export const fetchBoardsAPI = async (searchPath) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/boards${searchPath}`)
  return response.data
}

export const createNewBoardAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/boards`, data)
  toast.success('Board created successfully!')
  return response.data
}

export const updateBoardDetailsAPI = async (boardId, updateData) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/boards/${boardId}`, updateData)
  return response.data
}

export const deleteBoardAPI = async (boardId) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/boards/${boardId}`)
  return response.data
}

export const moveCardToDifferentColumnAPI = async (updateData) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/boards/supports/moving_cards`, updateData)
  return response.data
}

// COLUMN
export const createNewColumnAPI = async (newColumnData) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/columns`, newColumnData)
  return response.data
}

export const updateColumnDetailsAPI = async (columnId, updateData) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/columns/${columnId}`, updateData)
  return response.data
}

export const deleteColumnDetailsAPI = async (columnId) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/columns/${columnId}`)
  return response.data
}

// CARD
export const createNewCardAPI = async (newCardData) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/cards`, newCardData)
  return response.data
}

export const updateCardDetailsAPI = async (cardId, updateData) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/cards/${cardId}`, updateData)
  return response.data
}

export const uploadCardAttachmentsAPI = async (cardId, formData) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/cards/${cardId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

export const removeCardAttachmentAPI = async (cardId, publicId) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/cards/${cardId}`, {
    removeAttachmentPublicId: publicId
  })
  return response.data
}

export const deleteCardDetailsAPI = async (cardId) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/cards/${cardId}`)
  return response.data
}

// User
export const registerUserAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/users/register`, data)
  toast.success('Account created successfully! Please check and verify your account before logging in!', { theme: 'colored' })
  return response.data
}

export const inviteUserToBoardAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/invitations/board`, data)
  toast.success('User invited to board succesfully!')
  return response.data
}

export const verifyUserAPI = async (data) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/users/verify`, data)
  toast.success('Account verified successfully! Now you can log in and start using the app.', { theme: 'colored' })
  return response.data
}

export const refreshTokenAPI = async () => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/users/refresh_token`)
  return response.data
}

// Chatbot
export const chatBotAPI = async (data) => {
  const response = await authorizedAxiosInstance.post('/v1/chatbot/chat', data)
  return response.data
}

// Chat (Conversations and Messages)
export const fetchConversationsAPI = async (boardId) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/conversations/${boardId}`)
  return response.data
}

export const createNewConversationAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/conversations`, data)
  return response.data
}

export const fetchMessagesAPI = async (conversationId) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/messages/${conversationId}`)
  return response.data
}

export const createNewMessageAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/messages`, data)
  return response.data
}

// ========================= WORKSPACE APIs =========================
export const fetchWorkspacesAPI = async () => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/workspaces`)
  return response.data
}

export const createWorkspaceAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/workspaces`, data)
  toast.success('Workspace created successfully!')
  return response.data
}

export const getWorkspaceDetailsAPI = async (workspaceId) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/workspaces/${workspaceId}`)
  return response.data
}

export const updateWorkspaceAPI = async (workspaceId, data) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/workspaces/${workspaceId}`, data)
  return response.data
}

export const deleteWorkspaceAPI = async (workspaceId) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/workspaces/${workspaceId}`)
  return response.data
}

// Tạo board từ template (kèm columns có sẵn)
export const createBoardFromTemplateAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/workspaces/board-from-template`, data)
  toast.success('Board created from template successfully!')
  return response.data
}

// ========================= RECENT BOARDS APIs =========================
export const fetchRecentBoardsAPI = async () => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/users/recent-boards`)
  return response.data
}

export const trackRecentBoardAPI = async (boardId) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/users/recent-boards/${boardId}`)
  return response.data
}

// ========================= STARRED BOARDS APIs =========================
export const fetchStarredBoardsAPI = async () => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/users/starred-boards`)
  return response.data
}

export const toggleStarBoardAPI = async (boardId) => {
  const response = await authorizedAxiosInstance.patch(`${API_ROOT}/v1/users/starred-boards/${boardId}/toggle`)
  return response.data
}
