import React from 'react'
import { TextInput as GrommetTextInput } from 'grommet/components/TextInput'

import { palette } from '../constants'
import styled, { css } from 'styled-components'

export const TextInput = styled(GrommetTextInput)<{ isValid?: boolean }>`
  border-radius: 20px;
  box-shadow: none;
  font-weight: 400;
  border: 1px solid #dfe1e5;
  color: #333437;
  transition: border-color 250ms, box-shadow 250ms;

  &:focus,
  &:hover {
    background-color: #fff;
    box-shadow: 0 1px 5px rgb(32 33 36 / 26%);
    border-color: rgba(223, 225, 229, 0);
  }

  ${(props) =>
    !props.isValid &&
    css`
      border-color: ${palette.PinkRed};

      &:hover,
      &:focus {
        border-color: ${palette.LightRed};
        box-shadow: 0 1px 6px rgb(255 77 79 / 26%);
      }
    `}
`
