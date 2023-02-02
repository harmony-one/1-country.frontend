import React from 'react';
import {Box, Button} from "grommet";
import {GrClose} from "react-icons/gr";

interface Props {
  onClick: () => void
}

export const ModalHeader: React.FC<Props> = ({onClick}) => {
  return <Box direction="row" justify="end">
    <Button onClick={onClick} icon={<GrClose />} />
  </Box>;
};

ModalHeader.displayName = 'ModalHeader';
