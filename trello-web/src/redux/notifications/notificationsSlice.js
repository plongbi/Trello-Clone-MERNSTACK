import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authorizedAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'

// ============= STATE BAN ĐẦU =============
const initialState = {
  // Lời mời tham gia Board (đã có sẵn)
  currentNotifications: null,

  // Thông báo hoạt động thẻ (mới): comment, add member...
  cardNotifications: [],
  unreadCardCount: 0
}

// ============= ASYNC THUNKS - INVITATIONS (GIỮ NGUYÊN) =============
export const fetchInvitationsAPI = createAsyncThunk(
  'notifications/fetchInvitationsAPI',
  async () => {
    const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/invitations`)
    return response.data
  }
)

export const updateBoardInvitationAPI = createAsyncThunk(
  'notifications/updateBoardInvitationAPI',
  async ({ status, invitationId }) => {
    const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/invitations/board/${invitationId}`, { status })
    return response.data
  }
)

// ============= ASYNC THUNKS - CARD NOTIFICATIONS (MỚI) =============
export const fetchCardNotificationsAPI = createAsyncThunk(
  'notifications/fetchCardNotificationsAPI',
  async () => {
    const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/notifications`)
    return response.data
  }
)

export const markNotificationAsReadAPI = createAsyncThunk(
  'notifications/markNotificationAsReadAPI',
  async (notificationId) => {
    const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/notifications/${notificationId}/read`)
    return response.data
  }
)

export const markAllNotificationsAsReadAPI = createAsyncThunk(
  'notifications/markAllNotificationsAsReadAPI',
  async () => {
    const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/notifications/read-all`)
    return response.data
  }
)

// ============= SLICE =============
export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // --- Invitations (GIỮ NGUYÊN) ---
    clearCurrentNotifications: (state) => {
      state.currentNotifications = null
    },
    updateCurrentNotifications: (state, action) => {
      state.currentNotifications = action.payload
    },
    // Thêm 1 invitation mới vào đầu mảng (từ socket)
    addNotification: (state, action) => {
      const incomingInvitation = action.payload
      state.currentNotifications.unshift(incomingInvitation)
    },

    // --- Card Notifications (MỚI) ---
    // Thêm 1 thông báo thẻ mới từ socket, tránh trùng lặp
    addCardNotification: (state, action) => {
      const incoming = action.payload
      const isDuplicate = state.cardNotifications.some(n => n._id?.toString() === incoming._id?.toString())
      if (!isDuplicate) {
        state.cardNotifications.unshift(incoming)
        if (!incoming.isRead) {
          state.unreadCardCount += 1
        }
      }
    }
  },

  extraReducers: (builder) => {
    // --- Invitations (GIỮ NGUYÊN) ---
    builder.addCase(fetchInvitationsAPI.fulfilled, (state, action) => {
      let incomingInvitations = action.payload
      state.currentNotifications = Array.isArray(incomingInvitations) ? incomingInvitations.reverse() : []
    })
    builder.addCase(updateBoardInvitationAPI.fulfilled, (state, action) => {
      const incomingInvitation = action.payload
      if (!incomingInvitation) return
      const getInvitation = state.currentNotifications.find(i => i._id === incomingInvitation._id)
      if (getInvitation) {
        getInvitation.boardInvitation = incomingInvitation.boardInvitation
      }
    })

    // --- Card Notifications (MỚI) ---
    builder.addCase(fetchCardNotificationsAPI.fulfilled, (state, action) => {
      const data = action.payload || []
      state.cardNotifications = data
      state.unreadCardCount = data.filter(n => !n.isRead).length
    })
    builder.addCase(markNotificationAsReadAPI.fulfilled, (state, action) => {
      const updated = action.payload
      if (!updated) return
      const target = state.cardNotifications.find(n => n._id?.toString() === updated._id?.toString())
      if (target && !target.isRead) {
        target.isRead = true
        state.unreadCardCount = Math.max(0, state.unreadCardCount - 1)
      }
    })
    builder.addCase(markAllNotificationsAsReadAPI.fulfilled, (state) => {
      state.cardNotifications.forEach(n => { n.isRead = true })
      state.unreadCardCount = 0
    })
  }
})

// ============= ACTIONS =============
export const {
  clearCurrentNotifications,
  updateCurrentNotifications,
  addNotification,
  addCardNotification
} = notificationsSlice.actions

// ============= SELECTORS =============
export const selectCurrentNotifications = state => state.notifications.currentNotifications
export const selectCardNotifications = state => state.notifications.cardNotifications
export const selectUnreadCardCount = state => state.notifications.unreadCardCount

export const notificationsReducer = notificationsSlice.reducer