import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './routes/home/Home'
import LoginPage from './routes/login/Login'
import Navigation from './routes/navigation/Navigation'
import { Cancel } from './routes/pay/Cancel'
import { Success } from './routes/pay/Success'
import Tweet from './routes/tweet/Tweet'
import Verify from './routes/verify/Verify'

const AppRoutes = () => {
  // {/* <Route path='/auth'><LoginPage /></Route>
  //     <Route path='/verify'><Verify /></Route>
  //     <Route path='/tweet'><Tweet /></Route>
  //     <Route path='/success'><Success /></Route>
  //     <Route path='/cancel'><Cancel /></Route>
  //     <Route exact path='/' render={() => <Home />} />
  //     <Redirect to='/' /> */}
  return (
    <Routes>
      <Route path='/' element={<Navigation />}>
        <Route index element={<Home />} />
        <Route path='tweet/' element={<Tweet />} />
      </Route>
      <Route path='auth/' element={<LoginPage />} />
      <Route path='verify/' element={<Verify />} />
      <Route path='success/' element={<Success />} />
      <Route path='cancel/' element={<Cancel />} />
    </Routes>
  )
}

export default AppRoutes
