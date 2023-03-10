import React from 'react'
import { DynamicApp } from './Remote/DynamicApp'

const LiveStreamPage: React.FC = () => {
  return (
    <DynamicApp
      url="https://live.0.country/exports.js"
      scope="live"
      module="./App"
    />
  )
}
export default LiveStreamPage
