import styled from 'styled-components'
import { Col, FlexRow, Main } from '../../components/Layout'
import { Desc, SmallText } from '../../components/Text'

export const Banner = styled(Col)`
  justify-content: center;
  border-bottom: 1px solid black;
  padding: 8px 16px;
  position: fixed;
  background: #eee;
`

export const Container = styled(Main)`
  margin: 0 auto;
  padding: 0 16px;
  max-width: 800px;
  // TODO: responsive
`

export const TweetContainerRow = styled(FlexRow)`
  width: 100%;
  div {
    width: 100%;
  }
`
export const SmallTextGrey = styled(SmallText)`
  color: grey;
`

export const Label = styled(SmallTextGrey)`
  margin-right: 16px;
`

export const DescResponsive = styled(Desc)`
  @media(max-width: 640px){
    text-align: left;
    align-items: start;
  }
`
