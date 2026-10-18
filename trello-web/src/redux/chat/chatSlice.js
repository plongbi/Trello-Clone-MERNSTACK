import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  unreadConversationIds: []
}

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addUnreadConversation: (state, action) => {
      const convId = action.payload
      if (!state.unreadConversationIds.includes(convId)) {
        state.unreadConversationIds.push(convId)
      }
    },
    removeUnreadConversation: (state, action) => {
      const convId = action.payload
      state.unreadConversationIds = state.unreadConversationIds.filter(id => id !== convId)
    },
    clearAllUnread: (state) => {
      state.unreadConversationIds = []
    }
  }
})

export const { addUnreadConversation, removeUnreadConversation, clearAllUnread } = chatSlice.actions

export const selectUnreadConversationIds = (state) => state.chat.unreadConversationIds

export const chatReducer = chatSlice.reducer
