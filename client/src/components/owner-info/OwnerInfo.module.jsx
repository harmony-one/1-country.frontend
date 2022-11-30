import styled from 'styled-components'
import { Desc, SmallTextGrey } from '../../components/Text'

export const DescResponsive = styled(Desc)`
  @media(max-width: 640px){
    text-align: left;
    align-items: start;
  }
`

export const OnwerLabel = styled(SmallTextGrey)`
  margin-right: 16px;
`
