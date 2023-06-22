import React from 'react'
import { BaseText } from '../../components/Text'
import {
  ProcessStatusItem,
  ProcessStatusTypes,
} from '../../components/process-status/ProcessStatus'
import { RootStore } from '../../stores/RootStore'
import { BN } from 'bn.js'
import { RelayError, relayApi } from '../../api/relayApi'
import config from '../../../config'
import { sleep } from '../sleep'
import { DomainStore } from '../../stores/DomainStore'
import { WalletStore } from '../../stores/WalletStore'
import { daysBetween } from '../../api/utils'
import logger from '../../modules/logger'

const log = logger.module('renewCommandHandler')

type RenewCommandHandlerProps = {
  fromUrl: boolean
  domainName: string
  domainStore: DomainStore
  walletStore: WalletStore
  rootStore: RootStore
  setProcessStatus: React.Dispatch<React.SetStateAction<ProcessStatusItem>>
}

export const renewCommandHandler = async ({
  fromUrl = false,
  domainName,
  domainStore,
  walletStore,
  rootStore,
  setProcessStatus,
}: RenewCommandHandlerProps): Promise<boolean> => {
  try {
    let result = false
    if (fromUrl) {
      setProcessStatus({
        type: ProcessStatusTypes.PROGRESS,
        render: <BaseText>Renewing the Domain from url</BaseText>,
      })
      await sleep(3000)
    }
    const nftData = await relayApi().getNFTMetadata({
      domain: `${domainName}${config.tld}`,
    })
    const days = daysBetween(
      nftData['registrationDate'],
      domainStore.domainRecord.expirationTime
    )
    console.log({ nftData })
    console.log(days)
    if (true) {
      // days <= config.domain.renewalLimit) {
      setProcessStatus({
        type: ProcessStatusTypes.PROGRESS,
        render: <BaseText>{`Renewing ${domainName}${config.tld}`}</BaseText>,
      })
      if (!walletStore.isHarmonyNetwork || !walletStore.isConnected) {
        await walletStore.connect()
      }
      console.log(
        'domainStore.domainPrice.amount',
        domainStore.domainPrice.amount
      )
      const amount = domainStore.domainPrice.amount
      await renewCommand(domainName, amount, rootStore, setProcessStatus)

      await domainStore.loadDomainRecord(domainName)
      return true
    } else {
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: <BaseText>{`Error: Renewal Limit Reached`}</BaseText>,
      })
    }
    return result
  } catch (error) {
    log.error('renewCommandHandler', {
      error: error instanceof RelayError ? error.message : error,
      domain: `${domainName.toLowerCase()}${config.tld}`,
      address: walletStore.walletAddress,
    })

    setProcessStatus({
      type: ProcessStatusTypes.ERROR,
      render: (
        <BaseText>{`Error while renewing ${domainName}${config.tld}`}</BaseText>
      ),
    })
    console.log(error)
  }
}

const renewCommand = async (
  domainName: string,
  price: string,
  store: RootStore,
  setProcessStatus: React.Dispatch<React.SetStateAction<ProcessStatusItem>>
) => {
  try {
    const rentResult = await store.d1dcClient.renewDomain({
      name: domainName.toLowerCase(),
      amount: new BN(price).toString(),
      onTransactionHash: () => {
        setProcessStatus({
          type: ProcessStatusTypes.PROGRESS,
          render: <BaseText>Waiting for transaction confirmation</BaseText>,
        })
      },
      onSuccess: () => {
        setProcessStatus({
          type: ProcessStatusTypes.SUCCESS,
          render: <BaseText>Domain renewed</BaseText>,
        })
      },
      onFailed: (ex: Error) => {
        console.log('ERROR', ex)
        setProcessStatus({
          type: ProcessStatusTypes.ERROR,
          render: (
            <BaseText>
              {ex.message.length > 50
                ? ex.message.substring(0, 50) + '...'
                : ex.message}
            </BaseText>
          ),
        })
      },
    })
    if (rentResult.error) {
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: <BaseText>{rentResult.error.message}</BaseText>,
      })
      return
    }
    setProcessStatus({
      type: ProcessStatusTypes.PROGRESS,
      render: <BaseText>Updating NFT and domain Certificate</BaseText>,
    })
    sleep(4000)
    const renewNft = await relayApi().renewMetadata({
      domain: `${domainName}${config.tld}`,
    })
    console.log('renewNFT', { renewNft })
    if (!renewNft.renewed) {
      if (!renewNft.error.includes('already renewed')) {
        setProcessStatus({
          type: ProcessStatusTypes.ERROR,
          render: <BaseText>NFT Metadata wasn't updated</BaseText>,
        })
      }
    }
    const renewCert = await relayApi().renewCert({
      domain: `${domainName}${config.tld}`,
    })
    if (renewCert.error) {
      if (!renewCert.certExist) {
        try {
          const genCert = await relayApi().createCert({
            domain: `${domainName}${config.tld}`,
          })
          console.log('getCert', genCert)
        } catch (e) {
          setProcessStatus({
            type: ProcessStatusTypes.ERROR,
            render: (
              <BaseText>
                Domian renewed but the certificate wasn't generated. Please
                contact support
              </BaseText>
            ),
          })
          log.error('renewCommand - genCert', {
            error: e instanceof RelayError ? e.message : e,
            domain: `${domainName.toLowerCase()}${config.tld}`,
            price: price,
          })
          console.log('renewCommand - genCert', {
            error: e instanceof RelayError ? e.message : e,
            domain: `${domainName.toLowerCase()}${config.tld}`,
            price: price,
          })
          return
        }
      }
    }
    setProcessStatus({
      type: ProcessStatusTypes.SUCCESS,
      render: (
        <BaseText>The domain renewal process finished successfully</BaseText>
      ),
    })
    return rentResult
  } catch (error) {
    log.error('renewCommand', {
      error: error instanceof RelayError ? error.message : error,
      domain: `${domainName.toLowerCase()}${config.tld}`,
      price: price,
    })
    console.log('rent', error)
    return {
      error: error,
    }
  }
}
