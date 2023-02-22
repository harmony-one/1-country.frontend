import React from 'react'
import { Box, Button } from 'grommet'
import { GrClose } from 'react-icons/gr'
import { Title } from '../Text'

interface Props {
  title?: string
  onClick: () => void
}

export const ModalHeader: React.FC<Props> = ({ title, onClick }) => {
  return (
    <Box direction="row" justify="end">
      {title && <Title>{title}</Title>}
      <Button onClick={onClick} icon={<GrClose />} />
    </Box>
  )
}

ModalHeader.displayName = 'ModalHeader'
