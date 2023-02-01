import React from 'react'
import { Link } from 'react-router-dom';
import { Button } from '../../components/Controls';
import { Container, DescResponsive } from '../home/Home.styles';

export const Success = () => {
  return (
    <Container>
      <DescResponsive>
        <div>
          <h2>Payment status</h2>
          <h1 style={{ color: 'green' }}>Success</h1>
        </div>
        <div>
          <Link to={'/'}>
            <Button>
              Back to page
            </Button>
          </Link>
        </div>
      </DescResponsive>
    </Container>
  )
}