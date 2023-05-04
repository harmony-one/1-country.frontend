import styled from 'styled-components'
import { palette } from '../../constants'
import MasketInput from 'react-text-mask'

export const CurrencyInputContainer = styled.div`
  width: 90%;
  max-width: 340px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 20px;
  border: 1px solid #dfe1e5;
  padding-left: 1em;
  padding-right: 1em;
  &:hover,
  &:focus {
    background-color: #fff;
    box-shadow: 0 1px 5px rgb(32 33 36 / 26%);
    border-color: rgba(223, 225, 229, 0);
  }
`

export const CurrencyMasketInput = styled(MasketInput)`
  width: 100%;
  background-color: transparent;
  padding: 1em 2em 1em;
  font-size: 1rem;
  box-shadow: none;
  font-weight: 400;
  border: 0;
  color: ${palette.default};
  &:active,
  &:hover,
  &:focus {
    outline: none;
  }
`
