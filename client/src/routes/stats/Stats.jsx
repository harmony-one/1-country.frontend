import React from 'react'
import { FlexColumn } from '../../components/Layout'
import { Container } from '../home/Home.styles'
import { observer } from 'mobx-react-lite'
import { Title } from '../../components/Text'

const Stats = observer(() => {

  return (
    <Container>
        <FlexColumn style={{ width: '100%', height: '100%', alignItems: 'center' }}>
          <Title>Domain Stats</Title>
          <div id='main_block'>
            <iframe
              title='Stats'
              src='https://www.footprint.network/public/dashboard/Domain-Sales-fp-989a5037-a18e-4851-b68c-e38fcb006a74'
              frameBorder='0'
              width='1000'
              height='650'
              // allowtransparency
            />
          <br />
          <br />
          </div>
        </FlexColumn>
    </Container>
  )
})

export default Stats
