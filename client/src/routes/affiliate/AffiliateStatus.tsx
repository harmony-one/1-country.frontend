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
            src='//plotly.com/~abhinav55/1.embed'
            width='600'
            height='500'
          />
          <div><h1><br /></h1></div>
          <iframe
            title='numsales'
            src='//plotly.com/~abhinav55/3.embed'
            width='600'
            height='500'
          />
        </div>
      </FlexRow>
      <a href='https://explorer.harmony.one/address/0x691525d1783e7d2e3746dbb62a5308f7c791bd5d'><h6>Transaction History</h6></a>
</Container>

  )
})

export default Stats
