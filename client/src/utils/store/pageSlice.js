import { createSlice } from '@reduxjs/toolkit'

export const pageSlice = createSlice({
  name: 'page',
  initialState: {
    pageName: '',
  },
  reducers: {
    setPageName: (state, action) => {
      state.pageName = action.payload
    }
  },
})

export const { setPageName } = pageSlice.actions
export const selectPageName = state => state.page.pageName
export default pageSlice.reducer
