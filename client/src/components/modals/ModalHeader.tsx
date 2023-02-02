import React from 'react';
import {Box, Button} from "grommet";
import {AiOutlineCloseCircle} from "react-icons/all";

interface Props {
  onClick: () => void
}

export const ModalHeader: React.FC<Props> = ({onClick}) => {
  return <Box direction="row" justify="end">
    <Button onClick={onClick} icon={<AiOutlineCloseCircle />} />
  </Box>;
};

ModalHeader.displayName = 'ModalHeader';
