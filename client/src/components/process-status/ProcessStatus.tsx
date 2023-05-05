import React from 'react'
import { ProcessStatusContainer } from './ProcessStatus.styles'

export enum ProcessStatusTypes {
  IDLE = 'IDLE',
  PROGRESS = 'PROGRESS',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface ProcessStatusItem {
  type?: ProcessStatusTypes
  render: React.ReactNode
}

type Props = {
  status: ProcessStatusItem
}

export const ProcessStatus: React.FC<Props> = ({ status }) => {
  const { type = ProcessStatusTypes.PROGRESS, render = '' } = status
  return (
    <ProcessStatusContainer colorType={type}>
      {render}
      {/* <span style={{ color: 'red' }}>{type === statusTypes.ERROR ? 'Error' : ''}</span> */}
      {type === ProcessStatusTypes.PROGRESS && <div className="dot-elastic" />}
    </ProcessStatusContainer>
  )
}
