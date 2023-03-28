import styled from 'styled-components'
import { Main, FlexRow } from '../../components/Layout'
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

export const DomainNameContainer = styled.div`
  position: relative;
  width: 100%;

  @media (max-width: 640px) {
    margin-bottom: 1em;
  }
`

export const TipPageButton = styled(FlexRow)`
  position: absolute;
  right: 1em;
  top: 0;

  button {
    background-color: transparent;
    border: 0;
    font-size: 1rem;
    font-weight: 200;
  }

  @media (max-width: 640px) {
    right: initial;
    left: 50%;
    transform: translate(-50%, 0);
    top: 1.5em;
  }
`
