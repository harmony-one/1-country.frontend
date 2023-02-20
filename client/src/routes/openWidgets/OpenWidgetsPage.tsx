import React, { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { useStores } from '../../stores'
import { Container } from '../home/Home.styles'
import { GradientText } from '../../components/Text'
import { WidgetModule } from '../widgetModule/WidgetModule'

export const OpenWidgetsPage: React.FC = observer(() => {
  const { domainStore } = useStores()

  useEffect(() => {
    domainStore.loadDomainRecord()
  }, [])

  return (
    <Container>
      <div style={{ height: '2em' }} />
      <GradientText>{domainStore.domainName}.country</GradientText>
      <div style={{ height: '1em' }} />
      <WidgetModule domainName={domainStore.domainName} />
    </Container>
  )
})
