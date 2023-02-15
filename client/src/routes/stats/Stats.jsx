import React, { useEffect } from 'react'
import { FlexColumn } from '../../components/Layout'
import { Container, DescResponsive } from '../home/Home.styles'
import { observer } from 'mobx-react-lite'

const Stats = observer(() => {

  return (
    <Container>
      {(
        <FlexColumn style={{ width: '100%', alignItems: 'center' }}>
          <h2>{`Domain Stats`}</h2>
          <div id="main_block">
            <iframe id="left_frame"
              src="https://www.footprint.network/public/chart/Sales-Number-fp-79e271df-20cd-4b1a-a9a1-5cc5bd0a7197"    
              frameborder="0"    
              width="800"    
              height="600"    
              allowtransparency>
            </iframe>
          
          <br></br>
          <br></br>
          <br></br>
          
            <iframe id="right_frame"
              src="https://www.footprint.network/public/chart/Sales-Line-Chart-fp-b00f9184-c350-4ca1-b790-b1cd49410463"
              frameborder="0"
              width="800"
              height="600"
              allowtransparency>
            </iframe>
            <br></br>
            <br></br>
          </div>
        </FlexColumn>
      )}
    </Container>
  )
})

export default Stats
