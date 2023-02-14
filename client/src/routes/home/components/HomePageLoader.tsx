import React from 'react'
import { FlexColumn } from '../../../components/Layout'
import { Container } from '../Home.styles'

interface Props {}

export const HomePageLoader: React.FC<Props> = () => {
  return (
    <Container>
      <FlexColumn
        style={{
          marginTop: '10em',
          justifyContent: 'center',
          alignContent: 'center',
        }}
      >
        Uploading...
      </FlexColumn>
    </Container>
  )
}

HomePageLoader.displayName = 'Loader'
