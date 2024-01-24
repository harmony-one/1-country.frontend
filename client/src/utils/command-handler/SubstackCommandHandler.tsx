import React from 'react'
import { BaseText } from '../../components/Text'
import {
  ProcessStatusItem,
  ProcessStatusTypes,
} from '../../components/process-status/ProcessStatus'
import { RootStore } from '../../stores/RootStore'
import { EWSTypes, ewsApi } from '../../api/ews/ewsApi'
import { CommandValidator } from './commandValidator'
import {
  isValidSubstackUrl,
  isValidSubstackLandingUrl,
} from '../../../contracts/ews-common/substack-utils'
import { DomainStore } from '../../stores/DomainStore'
import { relayApi } from '../../api/relayApi'
import { sleep } from '../sleep'
import { urlExists } from '../../api/checkUrl'
import config from '../../../config'
import { NavigateFunction } from 'react-router'
import logger from '../../modules/logger'

const log = logger.module('addSubstackPageHandler')

type addSubstackPageHandlerProps = {
  command: CommandValidator
  domainName: string
  domainStore: DomainStore
  rootStore: RootStore
  navigate: NavigateFunction
  setProcessStatus: React.Dispatch<React.SetStateAction<ProcessStatusItem>>
}

export const addSubstackPageHandler = async ({
  command,
  domainName,
  domainStore,
  rootStore,
  navigate,
  setProcessStatus,
}: addSubstackPageHandlerProps) => {
  const url = command.url
  let result = false
  try {
    setProcessStatus({
      type: ProcessStatusTypes.PROGRESS,
      render: <BaseText>Validating Substack URL</BaseText>,
    })

    let substackId = command.url

    if (
      (isValidSubstackUrl(substackId) ||
        isValidSubstackLandingUrl(substackId)) &&
      substackId !== ''
    ) {
      if (substackId.endsWith('/')) {
        substackId = substackId.slice(0, substackId.length - 1)
      }
      if (substackId.startsWith('https://')) {
        substackId = substackId.slice('https://'.length)
      }

      const tx = await addSubstackPageCommand(
        domainStore.domainName,
        command.aliasName,
        substackId,
        [],
        rootStore,
        setProcessStatus
      )
      console.log('addSubstackPageCommand', tx)
      if (tx) {
        await sleep(7500)
        await relayApi().enableSubdomains(domainName)
        const landingPage = `${command.aliasName}.${domainName}${config.tld}`
        const fullUrl = `https://${landingPage}`
        setProcessStatus({
          type: ProcessStatusTypes.PROGRESS,
          render: <BaseText>Creating your Substack page...</BaseText>,
        })
        await sleep(5000)
        if (await urlExists(fullUrl)) {
          setProcessStatus({
            type: ProcessStatusTypes.SUCCESS,
            render: (
              <BaseText>
                Substack page created!. View your Substack page here:{' '}
                <span
                  onClick={() => {
                    window.location.assign(fullUrl)
                    navigate('/')
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <u>{`${landingPage}`}</u>
                </span>
              </BaseText>
            ),
          })
          return true
        } else {
          setProcessStatus({
            type: ProcessStatusTypes.ERROR,
            render: (
              <BaseText>
                Error processing the URL. Check {landingPage} later
              </BaseText>
            ),
          })
        }
      }
      return result
    } else {
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: (
          <BaseText>
            Invalid Substack page id. Please try another Substack URL.
          </BaseText>
        ),
      })
    }
  } catch (ex) {
    console.log('ERROR: FDSFDSFDSFDSSFSD', ex)
    log.error('addSubstackPageHandler', {
      error: ex,
      domain: `${domainName.toLowerCase()}${config.tld}`,
      alias: command.aliasName,
      url: command.url,
    })
    if (Object.prototype.toString.call(ex) === '[object Error]') {
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: (
          <BaseText>
            {`Unable to parse the Substack URL provided. Please try a different Substack URL. \n ${ex.toString()}`}
          </BaseText>
        ),
      })
    } else {
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: (
          <BaseText>
            Error processing the URL. Please verify it is a valid Substack URL.
          </BaseText>
        ),
      })
    }
    console.log(ex)
  }
  return result
}

const addSubstackPageCommand = async (
  domainName: string,
  subdomain: string,
  substackPageId: string,
  internalPageIds: string[],
  store: RootStore,
  setProcessStatus: React.Dispatch<React.SetStateAction<ProcessStatusItem>>
) => {
  try {
    setProcessStatus({
      type: ProcessStatusTypes.PROGRESS,
      render: <BaseText>Waiting for a transaction to be signed</BaseText>,
    })
    const tx = await store.ewsClient.update(
      domainName,
      subdomain,
      EWSTypes.EWS_SUBSTACK,
      substackPageId,
      internalPageIds,
      false
    )
    return tx
  } catch (e) {
    log.error('addNotionPageCommand', {
      error: e,
      domain: `${domainName.toLowerCase()}${config.tld}`,
      alias: subdomain,
      substackPageId: substackPageId,
    })
    console.log(e)
    setProcessStatus({
      type: ProcessStatusTypes.ERROR,
      render: <BaseText>Error embedding Substack Page</BaseText>,
    })
    return null
  }
}
