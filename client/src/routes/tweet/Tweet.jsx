import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import BN from 'bn.js'
import { selectPageName } from '../../utils/store/pageSlice'
import { FlexRow } from '../../components/Layout'
import { BaseText, Title } from '../../components/Text'
import config from '../../../config'

import { Container, DescResponsive } from '../home/Home.styles'
import TwitterSection from '../../components/twitter-section/TwitterSection'
import { useClient } from '../../hooks/useClient'

const parseBN = (n) => {
  try {
    return new BN(n)
  } catch (ex) {
    console.error(ex)
    return null
  }
}

const Tweet = () => {
  const [tweetId, setTweetId] = useState('')
  const [record, setRecord] = useState(null)
  const pageName = useSelector(selectPageName)
  const { client } = useClient()

  const pollParams = () => {
    if (!client) {
      return
    }
    client.getRecord({ pageName }).then((r) => setRecord(r))
  }
  console.log('record', record)
  useEffect(() => {
    if (!client) {
      return
    }
    pollParams()
  }, [client])

  useEffect(() => {
    if (!record?.url) {
      return
    }
    const id = parseBN(record.url)
    if (!id) {
      return
    }
    setTweetId(id.toString())
  }, [record?.url])

  return (
    <Container>
      <FlexRow style={{ alignItems: 'baseline', marginTop: 70 }}>
        <Title style={{ margin: 0 }}>{pageName}</Title>
        <a href={`https://${config.tldLink}`} target='_blank' rel='noreferrer' style={{ textDecoration: 'none' }}>
          <BaseText style={{ fontSize: 12, color: 'grey', marginLeft: '16px', textDecoration: 'none' }}>
            {pageName}
          </BaseText>
        </a>
      </FlexRow>
      <DescResponsive>
        {tweetId && (
          <TwitterSection tweetId={tweetId} pageName={pageName} client={client} />
        )}
      </DescResponsive>
      <h1>Tweet</h1>
    </Container>
  )
}

export default Tweet
