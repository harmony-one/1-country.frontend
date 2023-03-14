import React from 'react'
import styled from 'styled-components'
import {
  ProcessStatus,
  ProcessStatusTypes,
} from '../process-status/ProcessStatus'
import { observer } from 'mobx-react-lite'
import { useStores } from '../../stores'

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
  loaderId: string
  children: React.ReactNode
}

export const WidgetStatusWrapper: React.FC<Props> = observer(
  ({ loaderId, children }) => {
    const { loadersStore } = useStores()
    const processProcess = loadersStore.getLoader(loaderId)

    return (
      <Wrapper>
        {children}
        {processProcess.type !== ProcessStatusTypes.IDLE && (
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
