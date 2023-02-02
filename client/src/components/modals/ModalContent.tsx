import React from 'react';
import {Box} from "grommet";

interface Props {
  children: React.ReactNode
}

export const ModalContent: React.FC<Props> = ({children}) => {
  return <Box pad="12px">{children}</Box>;
};
