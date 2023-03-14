import React from 'react'
import styled from 'styled-components'
import {
  ProcessStatus,
  ProcessStatusTypes,
} from '../process-status/ProcessStatus'
import { observer } from 'mobx-react-lite'
import { widgetListStore } from '../../routes/widgetModule/WidgetListStore'

const Wrapper = styled.div`
  position: relative;
`

const StatusContainer = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  background-color: #9d9d9d61;
  display: flex;
  justify-content: center;
  border-radius: 12px;
  align-items: center;
`

const StatusContent = styled.div`
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  padding: 16px;
  margin: 0 12px;
`

interface Props {
  widgetId: number
  children: React.ReactNode
}

export const WidgetStatusWrapper: React.FC<Props> = observer(
  ({ widgetId, children }) => {
    const processProcess = widgetListStore.widgetStatus[widgetId]

    return (
      <Wrapper>
        {children}
        {processProcess && processProcess.type !== ProcessStatusTypes.IDLE && (
          <StatusContainer>
            <StatusContent>
              <ProcessStatus status={processProcess} />
            </StatusContent>
          </StatusContainer>
        )}
      </Wrapper>
    )
  }
)
