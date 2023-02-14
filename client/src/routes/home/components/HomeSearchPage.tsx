import React from 'react'
import { FlexRow } from '../../../components/Layout'
import { HomeSearchBlock } from './HomeSearchBlock'
import { Container } from '../Home.styles'

interface Props {}

export const HomeSearchPage: React.FC<Props> = () => {
  return (
    <Container>
      <FlexRow style={{ alignItems: 'baseline', marginTop: 25, width: '100%' }}>
        <HomeSearchBlock />
      </FlexRow>
    </Container>
  )
}
