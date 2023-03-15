import React from 'react'
import { Steps } from 'antd'
import styled from 'styled-components'
import {
  ProcessStatusItem,
  psHelpers,
} from '../../../components/process-status/ProcessStatus'
import { StepProps } from 'antd/es/steps'
import { Spinner } from 'grommet/components/Spinner'
import { Button } from '../../../components/Controls'
import { Box } from 'grommet/components/Box'

interface Props {
  step: number
  processStatus: ProcessStatusItem
  status: 'process' | 'error'
  onRetry: () => void
}

const StyledSteps = styled(Steps)`
  max-width: 320px;
`

export const RegistrationSteps: React.FC<Props> = ({
  step,
  status,
  onRetry,
  processStatus,
}) => {
  const items: StepProps[] = [
    {
      title: 'Validate domain name',
    },
    {
      title: 'Connect Metamask',
    },
    {
      title: 'Reserve domain',
    },
    {
      title: 'Rent Domain',
    },
    {
      title: 'Claim domain',
    },
  ]

  items[step].description = psHelpers.isError(processStatus) ? (
    <Box gap="12px">
      {processStatus.render}
      <Button onClick={onRetry}>Retry</Button>
    </Box>
  ) : (
    processStatus.render
  )
  items[step].icon = psHelpers.isProgress(processStatus) ? <Spinner /> : null

  return (
    <StyledSteps
      className="123"
      direction="vertical"
      current={step}
      status={status}
      size="small"
      items={items}
    />
  )
}
