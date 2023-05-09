import React, { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { HomePage } from './routes/home/HomePage'
import { HomePageLoader } from './routes/home/components/HomePageLoader'
import ClaimFreePage from './routes/claimFree/ClaimFreePage'

const StatsPage = lazy(
  () => import(/* webpackChunkName: "Others" */ './routes/stats/Stats')
)
const StatusPage = lazy(
  () => import(/* webpackChunkName: "Others" */ './routes/status/Status')
)
const AffiliateSalesPage = lazy(
  () =>
    import(
      /* webpackChunkName: "Others" */ './routes/affiliate/AffiliateStatus'
    )
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
        <Route path="status/" element={<StatusPage />} />
        <Route path="stats/" element={<StatsPage />} />
        <Route path="affiliatesales/" element={<AffiliateSalesPage />} />
        <Route path="details/" element={<DetailsPage />} />
        <Route path="claim-free" element={<ClaimFreePage />} />
        <Route path="live/" element={<LiveStreamPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Suspense>
  )
}

export default AppRoutes
