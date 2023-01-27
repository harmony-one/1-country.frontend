import { createSlice } from '@reduxjs/toolkit'
import { PROVIDER_TYPE } from '../sms-wallet/SmsWallet.utils'

export const walletSlice = createSlice({
  name: 'wallet',
  initialState: {
    wallet: '',
    provider: PROVIDER_TYPE.NONE,
    isHarmony: false,
    isWalletConnected: false
  },
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
  },
})

export const { setWallet, setProvider, setIsHarmony, setIsConnected } = walletSlice.actions
export const selectWallet = state => state.wallet.wallet
export const selectProvider = state => state.wallet.provider
export const selectIsHarmony = state => state.wallet.isHarmony
export const selectIsConnected = state => state.wallet.isWalletConnected
export default walletSlice.reducer
