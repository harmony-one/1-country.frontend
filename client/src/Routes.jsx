import React from 'react'
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom'
import Home from './routes/home/Home'

const Routes = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path='/' render={() => <Home />} />
        <Redirect to='/' />
      </Switch>
    </BrowserRouter>
  )
}

export default Routes
