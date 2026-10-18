import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  fetchWorkspacesAPI,
  createWorkspaceAPI,
  getWorkspaceDetailsAPI,
  updateWorkspaceAPI
} from '~/apis'

// Async Thunks
export const fetchWorkspacesThunk = createAsyncThunk(
  'workspace/fetchWorkspaces',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchWorkspacesAPI()
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const createWorkspaceThunk = createAsyncThunk(
  'workspace/createWorkspace',
  async (workspaceData, { rejectWithValue }) => {
    try {
      const data = await createWorkspaceAPI(workspaceData)
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState: {
    workspaces: [], // danh sách workspace của user
    activeWorkspace: null, // workspace đang được xem chi tiết
    loading: false,
    error: null
  },
  reducers: {
    setActiveWorkspace: (state, action) => {
      state.activeWorkspace = action.payload
    },
    clearWorkspaceError: (state) => {
      state.error = null
    },
    // Thêm workspace mới vào danh sách (optimistic update)
    addWorkspaceToList: (state, action) => {
      state.workspaces.unshift(action.payload)
    },
    // Cập nhật workspace trong danh sách
    updateWorkspaceInList: (state, action) => {
      const index = state.workspaces.findIndex(ws => ws._id === action.payload._id)
      if (index !== -1) state.workspaces[index] = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchWorkspaces
      .addCase(fetchWorkspacesThunk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchWorkspacesThunk.fulfilled, (state, action) => {
        state.loading = false
        state.workspaces = action.payload
      })
      .addCase(fetchWorkspacesThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // createWorkspace
      .addCase(createWorkspaceThunk.fulfilled, (state, action) => {
        state.workspaces.unshift(action.payload)
      })
  }
})

export const {
  setActiveWorkspace,
  clearWorkspaceError,
  addWorkspaceToList,
  updateWorkspaceInList
} = workspaceSlice.actions

export const selectWorkspaces = (state) => state.workspace.workspaces
export const selectActiveWorkspace = (state) => state.workspace.activeWorkspace
export const selectWorkspaceLoading = (state) => state.workspace.loading

export const workspaceReducer = workspaceSlice.reducer
