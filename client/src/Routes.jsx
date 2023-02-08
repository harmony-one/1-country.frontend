import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './routes/home/Home'
import OpenWidgets from './routes/open-widgets/OpenWidgets'
import WaitingRoom from './routes/waiting-room/WaitingRoom'

const AppRoutes = () => {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='new/:name' element={<WaitingRoom />} />
      <Route path='home/' element={<OpenWidgets />} />
    </Routes>
  )
}

export default AppRoutes
