import styled from 'styled-components'
import { FlexRow } from '../Layout'
import { palette } from '../../constants'

export const TipDomainPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 4em;
`

export const TipPageButton = styled(FlexRow)`
  padding-top: 0.2em;
  button {
    cursor: pointer;
    background-color: transparent;
    border: 0;
    font-size: 1rem;
    font-weight: 200;

    span {
      padding-left: 0.3em;
      font-size: 0.9rem;
      color: ${palette.default}
      font-weight: 200;
    }
  }
`
