import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { HomePage } from './routes/home/HomePage'
import Stats from './routes/stats/Stats'
import { PageNotFound } from './routes/404/404Page'
import WaitingRoom from './routes/waiting-room/WaitingRoom'
import { OpenWidgetsPage } from './routes/openWidgets/OpenWidgetsPage'

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="new/:domainName" element={<WaitingRoom />} />
      <Route path="home/" element={<OpenWidgetsPage />} />
      <Route path="stats/" element={<Stats />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  )
}

export default AppRoutes
