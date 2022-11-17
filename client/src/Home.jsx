import React, { useEffect, useState } from 'react'
import Web3 from 'web3'
import detectEthereumProvider from '@metamask/detect-provider'
import config from '../config'
import { Button, LinkWrarpper } from './components/Controls'
import { BaseText, Title } from './components/Text'
import { FlexColumn, FlexRow, Main } from './components/Layout'
import { TwitterTweetEmbed } from 'react-twitter-embed'
import styled from 'styled-components'

import { toast } from 'react-toastify'
import apis from './api'

const Container = styled(Main)`
  margin: 32px auto;
  max-width: 800px;

  // TODO: responsive
`

const Home = ({ name = 'test', subdomain = 'test', tweetId = '933354946111705097', price = 100, lastPurchaseDate = new Date() }) => {
  const [web3, setWeb3] = useState()
  const [provider, setProvider] = useState()
  const [address, setAddress] = useState()
  const [client, setClient] = useState(apis({}))

  async function init () {
    const provider = await detectEthereumProvider()
    setProvider(provider)
    setWeb3(new Web3(provider))
  }

  const connect = async () => {
    if (!web3) {
      toast.error('Wallet not found')
      return
    }
    try {
      const ethAccounts = await provider.request({ method: 'eth_requestAccounts' })

      if (ethAccounts.length >= 2) {
        return toast.info('Please connect using only one account')
      }
      const address = ethAccounts[0]
      setAddress(address)

      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: config.chainParameters.chainId }],
        })
        toast.success(`Switched to network: ${config.chainParameters.chainName}`)
        setClient(apis({ web3, address }))
      } catch (ex) {
        console.error(ex)
        if (ex.code !== 4902) {
          toast.error(`Failed to switch to network ${config.chainParameters.chainName}: ${ex.message}`)
          return
        }
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [config.chainParameters]
          })
          toast.success(`Added ${config.chainParameters.chainName} Network on MetaMask`)
        } catch (ex2) {
          // message.error('Failed to add Harmony network:' + ex.toString())
          toast.error(`Failed to add network ${config.chainParameters.chainName}: ${ex.message}`)
        }
      }

      window.ethereum.on('accountsChanged', accounts => setAddress(accounts[0]))
      window.ethereum.on('networkChanged', networkId => {
        console.log('networkChanged', networkId)
        init()
      })
    } catch (ex) {
      console.error(ex)
    }
  }

  useEffect(() => {
    init()
  }, [])

  useEffect(() => {
    setClient(apis({ web3, address }))
  }, [web3, address])

  useEffect(() => {
    if (!client) {
      return
    }
    // any other initialization on the client
    console.log(client)
  }, [client])

  const onBuy = async () => {
    try {
      const tx = await client.purchase({ amount: price * 2 })
      if (!tx) {
        return toast.error('Failed to approve')
      }
      console.log(tx)
      const { transactionHash } = tx
      toast.success(
        <FlexRow>
          <BaseText style={{ marginRight: 8 }}>Done!</BaseText>
          <LinkWrarpper target='_blank' href={client.getExplorerUri(transactionHash)}>
            <BaseText>View transaction</BaseText>
          </LinkWrarpper>
        </FlexRow>)
    } catch (ex) {
      console.error(ex)
      toast.error('Had error during approval: ', ex.toString())
    }
  }

  return (
    <Container>
      <FlexRow style={{ alignItems: 'baseline' }}>
        <Title style={{ margin: 0 }}>{name}</Title>
        <BaseText style={{ fontSize: 12, color: 'grey', marginLeft: '16px' }}>
          {subdomain}
        </BaseText>
      </FlexRow>
      {lastPurchaseDate && (
        <FlexColumn>
          <BaseText>Price: {price}</BaseText>
          <BaseText>Purchased on: {lastPurchaseDate.toString()}</BaseText>
        </FlexColumn>
      )}
      {tweetId && (
        <FlexRow className='tweetContainer'>
          <TwitterTweetEmbed tweetId={tweetId} />
        </FlexRow>)}

      {!address && <Button onClick={connect} style={{ width: 'auto' }}>CONNECT METAMASK</Button>}

      {address && config.debug && <BaseText>Your address: {address}</BaseText>}
      {/* TODO: allow change bid price */}
      {address && (
        <Button onClick={onBuy}>
          Buy
          <BaseText style={{ fontSize: '10px', display: 'inline', marginLeft: '8px' }}>({price * 2})</BaseText>
        </Button>
      )}
    </Container>
  )
}

export default Home
