import React, { useEffect, useState } from 'react'
import BN from 'bn.js'
import { Container, DescResponsive } from '../home/Home.styles'
import TwitterSection from '../../components/twitter-section/TwitterSection'
import { useOutletContext } from 'react-router'
import UserBlock from '../../components/user-block/UserBlock'

const parseBN = (n) => {
  try {
    return new BN(n)
  } catch (ex) {
    console.error(ex)
    return null
  }
}

const parseTweetId = (urlInput) => {
  try {
    const url = new URL(urlInput)
    if (url.host !== 'twitter.com') {
      return { error: 'URL must be from https://twitter.com' }
    }
    const parts = url.pathname.split('/')
    const BAD_FORM = {
      error:
        'URL has bad form. It must be https://twitter.com/[some_account]/status/[tweet_id]',
    }
    if (parts.length < 2) {
      return BAD_FORM
    }
    if (parts[parts.length - 2] !== 'status') {
      return BAD_FORM
    }
    const tweetId = parseBN(parts[parts.length - 1])
    if (!tweetId) {
      return { error: 'cannot parse tweet id' }
    }
    return { tweetId: tweetId.toString() }
  } catch (ex) {
    console.error(ex)
    return { error: ex.toString() }
  }
}

const Tweet = () => {
  const [tweetId, setTweetId] = useState('')
  const [message, setMessage] = useState('Loading tweet...')
  const {
    name,
    record,
    client,
    isOwner,
    walletAddress,
    isClientConnected
  } = useOutletContext()

  console.log(record, client, tweetId)
  useEffect(() => {
    if (!record?.url) {
      return
    }
    setTweetId(parseTweetId(record.url))
    if (record) {
      setMessage('The page doesn\'t have a linked tweet.')
    }
  }, [record?.url])

  return (
    <Container>
      <DescResponsive style={{ gap: 2 }}>
        <UserBlock isOwner={isOwner} client={client} walletAddress={walletAddress} isClientConnected={isClientConnected} showSocialMedia={false} />
        {tweetId
          ? (<TwitterSection tweetId={tweetId.tweetId} pageName={name} client={client} />)
          : <h3>{message}</h3>}
      </DescResponsive>
    </Container>
  )
}

export default Tweet
