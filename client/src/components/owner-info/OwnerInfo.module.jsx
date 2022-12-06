import styled from 'styled-components'
import { SmallTextGrey } from '../../components/Text'

export const OnwerLabel = styled(SmallTextGrey)`
  margin-right: 16px;
`
export const PersonalInfoRevealContainer = styled.div`
  width: 550px;

  .icon-button {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    border: 1px solid grey;
    padding: 0.3em 1em 0.3em;
    border-radius: 25px;
  }

  button {
    cursor: pointer;
    border: 1px solid grey;
    padding: 0.3em 1em 0.3em;
    border-radius: 25px;
    background-color: inherit;
  }

`
