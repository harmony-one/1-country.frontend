import React, { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { HomePage } from './routes/home/HomePage'
import { HomePageLoader } from './routes/home/components/HomePageLoader'

const StatsPage = lazy(
  () => import(/* webpackChunkName: "Others" */ './routes/stats/Stats')
)
const WaitingRoom = lazy(
  () =>
    import(
      /* webpackChunkName: "WaitingRoom" */ './routes/waiting-room/WaitingRoom'
    )
)
const DetailsPage = lazy(
  () => import(/* webpackChunkName: "Others" */ './routes/details/DetailsPage')
)
const LiveStreamPage = lazy(
  () => import(/* webpackChunkName: "Others" */ './routes/live/LiveStreamPage')
)
const OpenWidgetsPage = lazy(
  () =>
    import(
      /* webpackChunkName: "Others" */ './routes/openWidgets/OpenWidgetsPage'
    )
)
console.log('### WaitingRoom', WaitingRoom)

const AppRoutes = () => {
  return (
    <Suspense fallback={<HomePageLoader />}>
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
