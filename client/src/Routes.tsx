import React, { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { HomePage } from './routes/home/HomePage'

const StatsPage = lazy(() => import('./routes/stats/Stats'))
const WaitingRoom = lazy(() => import('./routes/waiting-room/WaitingRoom'))
const DetailsPage = lazy(() => import('./routes/details/DetailsPage'))
const LiveStreamPage = lazy(() => import('./routes/live/LiveStreamPage'))
const OpenWidgetsPage = lazy(
  () => import('./routes/openWidgets/OpenWidgetsPage')
)
console.log('### WaitingRoom', WaitingRoom)

const AppRoutes = () => {
  return (
    <Suspense fallback={<div>...</div>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="new/" element={<WaitingRoom />} />
        <Route path="new/:domainName" element={<WaitingRoom />} />
        <Route path="home/" element={<OpenWidgetsPage />} />
        <Route path="stats/" element={<StatsPage />} />
        <Route path="details/" element={<DetailsPage />} />
        <Route path="live/" element={<LiveStreamPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Suspense>
  )
}

export default AppRoutes
