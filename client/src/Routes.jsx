import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './routes/home/Home'
import Stats from './routes/stats/Stats'
import { PageNotFound } from './routes/404/404Page'

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="stats/" element={<Stats />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  )
}

export default AppRoutes
