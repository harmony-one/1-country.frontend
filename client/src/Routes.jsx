import React from 'react'
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom'
import Home from './routes/home/Home'
import LoginPage from './routes/login/Login'
import Verify from './routes/verify/Verify'

const Routes = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path='/auth'>
          <LoginPage />
        </Route>
        <Route path='/verify'>
          <Verify />
        </Route>
        <Route exact path='/' render={() => <Home />} />
        <Redirect to='/' />
      </Switch>
    </BrowserRouter>
  )
}

export default Routes
