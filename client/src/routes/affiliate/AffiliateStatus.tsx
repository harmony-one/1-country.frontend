import React from 'react'
import { FlexRow } from '../../components/Layout'
import { Container } from '../home/Home.styles'
import { observer } from 'mobx-react-lite'
import { Title } from '../../components/Text'

const Stats = observer(() => {
  return (
    <Container>
      <Title>1Country Affiliate Sales</Title>
      <FlexRow style={{ alignItems: 'left' }}>
        
        <div id="container" style={{ display: 'flex', justifyContent: 'left' }}>
          <iframe
            title='numsales'
            src='//plotly.com/~aishlia/192.embed'
            width='600'
            height='500'
          />
          <div><h1><br /></h1></div>
          <iframe
            title='numsales'
            src='//plotly.com/~aishlia/196.embed'
            width='600'
            height='500'
          />
        </div>
      </FlexRow>
</Container>

  )
})

export default Stats
