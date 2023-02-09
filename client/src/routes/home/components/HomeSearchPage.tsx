import React from 'react'
import { FlexRow } from '../../../components/Layout'
import { SearchBlock } from './SearchBlock'
import { Container } from '../Home.styles'

interface Props {}

export const HomeSearchPage: React.FC<Props> = () => {
  return (
    <Container>
      <FlexRow style={{ alignItems: 'baseline', marginTop: 25, width: '100%' }}>
        <SearchBlock />
      </FlexRow>
    </Container>
  )
}
