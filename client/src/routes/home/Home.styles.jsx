import styled from 'styled-components'
import { Main } from '../../components/Layout'
import { SmallTextGrey, Desc } from '../../components/Text'

export const Container = styled(Main)`
  margin: 0 auto;
  padding: 0 16px;
  max-width: 800px;
  // TODO: responsive
`
export const PageHeader = styled.div`
  display: flex;
  direction: row;
  justify-content: space-between;
  gap: 3em;
  
`
export const HomeLabel = styled(SmallTextGrey)`
  margin-right: 16px;
`

export const DescResponsive = styled(Desc)`
  @media(max-width: 640px){
    text-align: left;
    align-items: start;
  }
`
