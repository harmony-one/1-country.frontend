import React from 'react'
import { Box } from 'grommet/components/Box'
import { Button } from 'grommet/components/Button'
import { Close } from '../icons/Close'
import { Title } from '../Text'

interface Props {
  title?: string
  onClick: () => void
}

export const ModalHeader: React.FC<Props> = ({ title, onClick }) => {
  return (
    <Box direction="row" justify="end">
      {title && <Title>{title}</Title>}
      <Button onClick={onClick} icon={<Close />} />
    </Box>
  )
}

ModalHeader.displayName = 'ModalHeader'
