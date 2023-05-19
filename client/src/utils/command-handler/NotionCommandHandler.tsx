import React from 'react'
import { BaseText } from '../../components/Text'
import {
  ProcessStatusItem,
  ProcessStatusTypes,
} from '../../components/process-status/ProcessStatus'
import { RootStore } from '../../stores/RootStore'
import { EWSTypes, ewsApi } from '../../api/ews/ewsApi'
import { CommandValidator } from './commandValidator'
import { isValidNotionPageId } from '../../../contracts/ews-common/notion-utils'
import { DomainStore } from '../../stores/DomainStore'
import { relayApi } from '../../api/relayApi'
import { sleep } from '../sleep'
import { urlExists } from '../../api/checkUrl'
import config from '../../../config'
import { NavigateFunction } from 'react-router'

type AddNotionPageHandlerProps = {
  command: CommandValidator
  domainName: string
  domainStore: DomainStore
  rootStore: RootStore
  navigate: NavigateFunction
  setProcessStatus: React.Dispatch<React.SetStateAction<ProcessStatusItem>>
}

export const addNotionPageHandler = async ({
  command,
  domainName,
  domainStore,
  rootStore,
  navigate,
  setProcessStatus,
}: AddNotionPageHandlerProps) => {
  const url = command.url
  let result = false
  try {
    setProcessStatus({
      type: ProcessStatusTypes.PROGRESS,
      render: <BaseText>Validating Notion URL</BaseText>,
    })
    const notionPageId = await ewsApi.parseNotionPageIdFromRawUrl(command.url)

    if (notionPageId === null) {
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: (
          <BaseText>
            Failed to extract notion page id. Please verify your Notion URL.
          </BaseText>
        ),
      })
      return result
    }

    if (isValidNotionPageId(notionPageId) && notionPageId !== '') {
      try {
        const internalPagesId = await ewsApi.getSameSitePageIds(notionPageId, 0)
        const tx = await addNotionPageCommand(
          domainStore.domainName,
          command.aliasName,
          notionPageId,
          internalPagesId,
          rootStore,
          setProcessStatus
        )
        console.log('addNotionPageCommand', tx)
        if (tx) {
          await sleep(7500)
          await relayApi().enableSubdomains(domainName)
          const landingPage = `${command.aliasName}.${domainName}${config.tld}`
          const fullUrl = `https://${landingPage}`
          setProcessStatus({
            type: ProcessStatusTypes.PROGRESS,
            render: <BaseText>Creating your Notion page...</BaseText>,
          })
          await sleep(5000)
          if (await urlExists(fullUrl)) {
            setProcessStatus({
              type: ProcessStatusTypes.SUCCESS,
              render: (
                <BaseText>
                  Notion page created!. View your notion page here:{' '}
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
      } catch (e) {
        console.log(e)
        setProcessStatus({
          type: ProcessStatusTypes.ERROR,
          render: (
            <BaseText>
              Error adding internal pages. Please try adding your Notion page
              again.
            </BaseText>
          ),
        })
        return result
      }
    } else {
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: (
          <BaseText>
            Invalid Notion page id. Please try another Notion URL.
          </BaseText>
        ),
      })
    }
  } catch (e) {
    console.log(e)
    if (Object.prototype.toString.call(e) === '[object Error]') {
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: (
          <BaseText>
            {`Unable to parse the Notion URL provided. Please try a different Notion URL. \n ${e.toString()}`}
          </BaseText>
        ),
      })
    } else {
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: (
          <BaseText>
            Error processing the URL. Please verify it is a valid Notion URL.
          </BaseText>
        ),
      })
    }
    console.log(e)
  }
  return result
}

const addNotionPageCommand = async (
  domainName: string,
  subdomain: string,
  notionPageId: string,
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
      EWSTypes.EWS_NOTION,
      notionPageId,
      internalPageIds,
      false
    )
    return tx
  } catch (e) {
    console.log(e)
    setProcessStatus({
      type: ProcessStatusTypes.ERROR,
      render: <BaseText>Error embedding Notion Page</BaseText>,
    })
    return null
  }
}
