import React, { useEffect } from 'react'
import { FlexColumn } from '../../components/Layout'
import { Container, DescResponsive } from '../home/Home.styles'
import { observer } from 'mobx-react-lite'

const Stats = observer(() => {

  return (
    <Container>
      {(
        <FlexColumn style={{ width: '100%', height: '100%', alignItems: 'center' }}>
          <h2>{`Domain Stats`}</h2>
          <div id="main_block">
            <iframe
              src="https://www.footprint.network/public/dashboard/Domain-Sales-fp-989a5037-a18e-4851-b68c-e38fcb006a74"
              frameborder="0"
              width="1000"
              height="650"
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
