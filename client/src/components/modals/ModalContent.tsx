import React from 'react';
import {Box} from "grommet";
import styled from "styled-components";

interface Props {
  children: React.ReactNode
}

const BoxStyled = styled(Box)`
  min-width: 350px;
`

export const ModalContent: React.FC<Props> = ({children}) => {
  return <BoxStyled pad="24px">{children}</BoxStyled>;
};
