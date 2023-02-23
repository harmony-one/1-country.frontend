import React from "react"
import { ProcessStatusContainer } from "./ProcessStatus.styles"

export const statusTypes = {
  INFO: 0,
  SUCCESS: 1, 
  ERROR: 2
}

export type ProcessStatusProps = {
  type?: number,
  render: any
}

const ProcessStatus = ({ type = statusTypes.INFO, render = '' }: ProcessStatusProps) => {
  return (
    <ProcessStatusContainer colorType={type}>
      {render}
      {/* <span style={{ color: 'red' }}>{type === statusTypes.ERROR ? 'Error' : ''}</span> */}
      { type === statusTypes.INFO && <div className="dot-elastic"></div>}
    </ProcessStatusContainer>
  )
}

export default ProcessStatus