import { createSlice } from '@reduxjs/toolkit'

// Khởi tạo gtri State của 1 slice trong redux
const initialState = {
  currentActiveCard: null,
  isShowModalActiveCard: false
}

// Khởi tạo 1 slice trong kho lưu trữ Redux
export const activeCardSlice = createSlice({
  name: 'activeCard',
  initialState,
  // Reducers: Nơi xử lý dữ liệu đồng bộ
  reducers: {
    showModalActiveCard: (state) => {
      state.isShowModalActiveCard = true
    },

    // Clear data và đóng modal activeCard
    clearAndHideCurrentActiveCard: (state) => {
      state.currentActiveCard = null
      state.isShowModalActiveCard = false
    },

    updateCurrentActiveCard: (state, action) => {
      const fullCard = action.payload

      // Xử lý dữ liệu nếu cần thiết

      // Update dữ liệu của currentActiveCard
      state.currentActiveCard = fullCard
    }
  },
  // ExtraReducers: Nơi xử lý dữ liệu bất đồng bộ
  // eslint-disable-next-line no-unused-vars
  extraReducers: (builder) => {}
})

// Actions: Nơi dành cho các components bên dưới gọi bằng dispatch() tới nó để update lại dữ liệu thông qua reducer (chạy đồng bộ)
export const {
  clearAndHideCurrentActiveCard,
  updateCurrentActiveCard,
  showModalActiveCard
} = activeCardSlice.actions

// Selectors: Nơi dành cho các components bên dưới gọi bằng hook useSelector() để lấy dữ liệu từ kho redux sử dụng
export const selectCurrentActiveCard = (state) => {
  return state.activeCard.currentActiveCard
}

export const selectIsShowModalActiveCard = (state) => {
  return state.activeCard.isShowModalActiveCard
}

export const activeCardReducer = activeCardSlice.reducer