import React, { useEffect } from 'react'
import { Container, DescResponsive } from '../home/Home.styles'

const Live = () => {
  useEffect(() => {
    setTimeout(function () {
      window.open('https://live.0.country', '_self')
    }, 2000)
  }, [])

  return (
    <Container>
      <DescResponsive style={{ gap: 2 }}>
        <h3>Redirecting to live videos...</h3>
      </DescResponsive>
    </Container>
  )
}

export default Live
