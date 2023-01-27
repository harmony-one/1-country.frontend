import { createSlice } from '@reduxjs/toolkit'
import { PROVIDER_TYPE } from '../sms-wallet/SmsWallet.utils'

const initalState = {
  wallet: '',
  provider: PROVIDER_TYPE.NONE,
  isHarmony: false,
  isWalletConnected: false
}
export const walletSlice = createSlice({
  name: 'wallet',
  initialState: initalState,
  reducers: {
    setWallet: (state, action) => {
      state.wallet = action.payload
    },
    setProvider: (state, action) => {
      state.provider = action.payload
    },
    setIsHarmony: (state, action) => {
      state.isHarmony = action.payload
    },
    setIsWalletConnected: (state, action) => {
      state.isWalletConnected = action.payload
    },
    walletLogOut: (state) => {
      return initalState
    }
  },
})

export const { setWallet, setProvider, setIsHarmony, setIsWalletConnected, walletLogOut } = walletSlice.actions
export const selectWallet = state => state.wallet.wallet
export const selectProvider = state => state.wallet.provider
export const selectIsHarmony = state => state.wallet.isHarmony
export const selectIsWalletConnected = state => state.wallet.isWalletConnected
export default walletSlice.reducer
