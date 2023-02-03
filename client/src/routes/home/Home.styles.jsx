import React from 'react'
import styled from 'styled-components'
import { Main } from '../../components/Layout'
import { SmallTextGrey, Desc } from '../../components/Text'
import { observer } from 'mobx-react-lite'
import { useStores } from '../../stores'

export const StyledContainer = styled(Main)`
  margin: 0 auto;
  /* padding: 0 16px; */
  max-width: 800px;
  background-color: ${(props) => props.bgColor};
  // TODO: responsive
`

export const Container = observer(({ children }) => {
  const { domainRecordStore } = useStores()

  console.log(
    '### domainRecordStore.profile.bgColor',
    domainRecordStore.profile.bgColor
  )
  return (
    <StyledContainer bgColor={domainRecordStore.profile.bgColor}>
      {children}
    </StyledContainer>
  )
})

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
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;

  /* @media(max-width: 640px){
    text-align: left;
    align-items: start;
  } */
`
