import { configureStore, combineReducers } from '@reduxjs/toolkit'
import walletReducer from './walletSlice'
import pageReducer from './pageSlice'
import storage from 'redux-persist/lib/storage'
import thunk from 'redux-thunk'
import {
  persistReducer,
  persistStore
} from 'redux-persist'

const persistConfig = {
  key: 'root',
  storage: storage,
}

const rootReducer = combineReducers({
  wallet: walletReducer,
  page: pageReducer
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: [thunk]
})

export const persistor = persistStore(store)
