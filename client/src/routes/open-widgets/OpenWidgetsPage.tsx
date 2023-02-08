import React, { useEffect } from 'react'
import { useStores } from '../../stores'
import { Container } from '../home/Home.styles'

export const OpenWidgetsPage = () => {
  const { domainStore } = useStores()

  useEffect(() => {
    domainStore.loadDomainRecord()
  }, [])

  return <Container>Open Widget</Container>
}
