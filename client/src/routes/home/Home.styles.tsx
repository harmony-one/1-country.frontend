import styled from 'styled-components'
import { Main } from '../../components/Layout'
import { SmallTextGrey, Desc } from '../../components/Text'

export const Container = styled(Main)`
  margin: 0 auto;
  padding: 0 24px 24px;
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`
export const PageHeader = styled.div`
  display: flex;
  direction: row;
  justify-content: space-between;
  align-content: center;
  width: 100%;
`

export const RecordRenewalContainer = styled.div`
  border: 1px dashed #758796;
  border-radius: 10px;
  padding: 1.5em;
  display: flex;
  flex-direction: column;
  align-content: center;
  text-align: center;
  align-items: center;
  justify-content: center;
  gap: 1em;
`

export const HomeLabel = styled(SmallTextGrey)`
  margin-right: 16px;
`

export const DescResponsive = styled(Desc)`
  /* @media(max-width: 640px){
    text-align: left;
    align-items: start;
  } */
`
