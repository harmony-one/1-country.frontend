import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './routes/home/Home'
import Live from './routes/live/Live'
import LoginPage from './routes/login/Login'
import Navigation from './routes/navigation/Navigation'
import { Cancel } from './routes/pay/Cancel'
import { Success } from './routes/pay/Success'
import Tweet from './routes/tweet/Tweet'
import Verify from './routes/verify/Verify'

const AppRoutes = () => {
  return (
    <Routes>
      <Route path='/' element={<Navigation />}>
        <Route index element={<Home />} />
        <Route path='tweet/' element={<Tweet />} />
        <Route path='live/' element={<Live />} />
      </Route>
      <Route path='auth/' element={<LoginPage />} />
      <Route path='verify/' element={<Verify />} />
      <Route path='success/' element={<Success />} />
      <Route path='cancel/' element={<Cancel />} />
    </Routes>
  )
}

export default AppRoutes
