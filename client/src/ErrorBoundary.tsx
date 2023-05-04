import React, { Component, ErrorInfo, ReactNode } from 'react'
import logger from './modules/logger'
import { appHealthy } from './api/betteruptime'
const log = logger.module('Main')

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    log.error('Uncaught error:', { error, errorInfo })
  }

  public async componentDidMount() {
    if (!this.state.hasError) {
      appHealthy()
    }
  }

  public async componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevState.hasError && !this.state.hasError) {
      appHealthy()
    }
  }

  public render() {
    if (this.state.hasError) {
      return <h1>Sorry.. there was an error</h1>
    }

    return this.props.children
  }
}

export default ErrorBoundary
