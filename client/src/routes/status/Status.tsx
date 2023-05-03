import React from 'react'
import { FlexColumn } from '../../components/Layout'
import { Container } from '../home/Home.styles'
import { observer } from 'mobx-react-lite'
import { Title } from '../../components/Text'

const Stats = observer(() => {
  return (
    <Container>
      <FlexColumn
        style={{ width: '100%', height: '100%', alignItems: 'center' }}
      >
        <Title>1Country Status</Title>
        <div id="main_block">
          <iframe
            title="Status"
            src="https://1country.betteruptime.com"
            frameBorder="0"
            width="800"
            height="650"
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
