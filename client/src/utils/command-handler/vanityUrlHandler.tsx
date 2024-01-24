import React from 'react'
import { BaseText } from '../../components/Text'
import {
  ProcessStatusItem,
  ProcessStatusTypes,
} from '../../components/process-status/ProcessStatus'
import { CommandValidator } from './commandValidator'
import { RootStore } from '../../stores/RootStore'
import config from '../../../config'
import logger from '../../modules/logger'

const log = logger.module('vanityUrlHandler')

type VanityUrlHandlerProps = {
  vanity: CommandValidator
  fromUrl: boolean
  domainName: string
  rootStore: RootStore
  setProcessStatus: React.Dispatch<React.SetStateAction<ProcessStatusItem>>
}

export const vanityUrlHandler = async ({
  vanity,
  fromUrl = false,
  domainName,
  rootStore,
  setProcessStatus,
}: VanityUrlHandlerProps): Promise<boolean> => {
  let result = false
  const urlExists = await rootStore.vanityUrlClient.existURL({
    name: domainName,
    aliasName: vanity.aliasName,
  })
  const method = urlExists ? 'updateURL' : 'addNewURL'

  setProcessStatus({
    type: ProcessStatusTypes.PROGRESS,
    render: (
      <BaseText>{`${
        urlExists ? 'Updating' : 'Creating'
      } ${`${domainName}${config.tld}/${vanity.aliasName}`} url`}</BaseText>
    ),
  })
  const vanityResult = await rootStore.vanityUrlClient[method]({
    name: domainName,
    aliasName: vanity.aliasName,
    url: vanity.url,
    price: config.vanityUrl.price + '',
    onTransactionHash: () => {
      setProcessStatus({
        type: ProcessStatusTypes.PROGRESS,
        render: <BaseText>Waiting for transaction confirmation</BaseText>,
      })
    },
    onSuccess: ({ transactionHash }) => {
      console.log('success', transactionHash)
      setProcessStatus({
        type: ProcessStatusTypes.SUCCESS,
        render: (
          <BaseText>
            <a
              href={vanity.url}
            >{`${domainName}${config.tld}/${vanity.aliasName}`}</a>
            {` ${urlExists ? 'updated' : 'created'}`}
          </BaseText>
        ),
      })
    },
    onFailed: (ex: Error) => {
      log.error('vanityUrlHandler', {
        error: ex,
        aliasName: vanity.aliasName,
        url: vanity.url,
        domain: `${domainName.toLowerCase()}${config.tld}`,
      })
      console.log('ERRROR', ex)
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: (
          <BaseText>
            Error {urlExists ? 'updating' : 'creating'} Vanity URL
          </BaseText>
        ),
      })
    },
  })
  if (!vanityResult.error) {
    return true
  }
  return result
}

export const deleteVanityUrlHandler = async ({
  vanity,
  fromUrl = false,
  domainName,
  rootStore,
  setProcessStatus,
}: VanityUrlHandlerProps): Promise<boolean> => {
  let result = false
  const urlExists = await rootStore.vanityUrlClient.existURL({
    name: domainName,
    aliasName: vanity.aliasName,
  })

  if (!urlExists) {
    setProcessStatus({
      type: ProcessStatusTypes.SUCCESS,
      render: (
        <BaseText>{`The alias ${domainName}${config.tld}/${vanity.aliasName} was deleted`}</BaseText>
      ),
    })
    return true
  }
  const vanityResult = await rootStore.vanityUrlClient.deleteUrl({
    name: domainName,
    aliasName: vanity.aliasName,
    onTransactionHash: () => {
      setProcessStatus({
        type: ProcessStatusTypes.PROGRESS,
        render: <BaseText>Waiting for transaction confirmation</BaseText>,
      })
    },
    onSuccess: ({ transactionHash }) => {
      console.log('success', transactionHash)
      setProcessStatus({
        type: ProcessStatusTypes.SUCCESS,
        render: (
          <BaseText>
            <a
              href={vanity.url}
            >{`${domainName}${config.tld}/${vanity.aliasName}`}</a>
            {` deleted `}
          </BaseText>
        ),
      })
    },
    onFailed: (ex: Error) => {
      log.error('deleteVanityUrlHandler', {
        error: ex,
        aliasName: vanity.aliasName,
        url: vanity.url,
        domain: `${domainName.toLowerCase()}${config.tld}`,
      })
      console.log('ERRROR', ex)
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: <BaseText>Error deleting Vanity URL</BaseText>,
      })
    },
  })
  if (!vanityResult.error) {
    return true
  }
  return result
}
