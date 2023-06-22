import React from 'react'
import { BaseText } from '../../components/Text'
import {
  ProcessStatusItem,
  ProcessStatusTypes,
} from '../../components/process-status/ProcessStatus'
import { sleep } from '../sleep'
import { WalletStore } from '../../stores/WalletStore'
import { RootStore } from '../../stores/RootStore'
import { ethers } from 'ethers'
import { easServerClient } from '../../api/eas/easServerClient'
import { getEthersError } from '../../api/utils'
import { isEmail, isEmailId } from '../validation'
import logger from '../../modules/logger'
import config from '../../../config'

const log = logger.module('EmailHandler')

type EmailHandlerProps = {
  alias: string
  forward: string
  fromUrl: boolean
  domainName: string
  rootStore: RootStore
  walletStore: WalletStore
  setProcessStatus: React.Dispatch<React.SetStateAction<ProcessStatusItem>>
}

export const EmailHandler = async ({
  alias,
  forward,
  fromUrl = false,
  domainName,
  rootStore,
  walletStore,
  setProcessStatus,
}: EmailHandlerProps): Promise<boolean> => {
  let result = false

  setProcessStatus({
    type: ProcessStatusTypes.PROGRESS,
    render: (
      <BaseText>
        {walletStore.isMetamaskAvailable
          ? 'Waiting for a transaction to be signed'
          : 'Sign transaction on mobile device'}
      </BaseText>
    ),
  })

  try {
    console.log('domainName', domainName)
    const numAlias = await rootStore.easClient.getNumAlias(domainName)
    const maxAlias = await rootStore.easClient.maxNumAlias()
    const publicAliases = await rootStore.easClient.getPublicAliases(domainName)
    console.log('### maxNum', maxAlias)
    console.log('### numAlias', numAlias)
    console.log('### publicAliases', publicAliases)
    console.log(
      'validating email',
      isEmail(forward),
      isEmailId(alias),
      !isEmail(forward) || !isEmailId(alias)
    )
    if (!isEmail(forward)) {
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: <BaseText>Wrong email address</BaseText>,
      })
      return result
    }
    if (!isEmailId(alias)) {
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: <BaseText>Wrong email alias</BaseText>,
      })
      return result
    }
    if (fromUrl) {
      setProcessStatus({
        type: ProcessStatusTypes.PROGRESS,
        render: <BaseText>Adding email alias from url</BaseText>,
      })
      await sleep(3000)
    }
    if (numAlias >= maxAlias) {
      setProcessStatus({
        type: ProcessStatusTypes.PROGRESS,
        render: (
          <BaseText>
            {walletStore.isMetamaskAvailable
              ? 'Waiting for a transaction to be signed'
              : 'Sign transaction on mobile device'}
          </BaseText>
        ),
      })

      const removingAlias = publicAliases[0]

      setProcessStatus({
        type: ProcessStatusTypes.PROGRESS,
        render: <BaseText>Removing old alias: {removingAlias}</BaseText>,
      })

      const delResult = await rootStore.easClient.deactivateAll({
        domainName,
        onTransactionHash: () => {
          setProcessStatus({
            type: ProcessStatusTypes.PROGRESS,
            render: <BaseText>Waiting for transaction confirmation</BaseText>,
          })
        },
      })

      if (delResult.error) {
        const message = getEthersError(delResult.error) || 'Please contact us'
        setProcessStatus({
          type: ProcessStatusTypes.ERROR,
          render: <BaseText>Deactivation failed. {message}</BaseText>,
        })
        return result
      }
    }

    const signature = await rootStore.easClient.buildSignature(
      domainName,
      alias,
      forward
    )
    const separator = ethers.utils.toUtf8Bytes(
      await rootStore.easClient.getSeparator()
    )
    const data = ethers.utils.concat([
      ethers.utils.toUtf8Bytes(alias),
      separator,
      ethers.utils.toUtf8Bytes(forward),
      separator,
      signature,
    ])
    let makePublic = true
    const commitment = ethers.utils.keccak256(data)

    console.log('### publicAliases', publicAliases)

    if (publicAliases.includes(alias)) {
      makePublic = false
    }

    setProcessStatus({
      type: ProcessStatusTypes.PROGRESS,
      render: (
        <BaseText>
          {walletStore.isMetamaskAvailable
            ? 'Waiting for a transaction to be signed'
            : 'Sign transaction on mobile device'}
        </BaseText>
      ),
    })

    const activateResult = await rootStore.easClient.activate({
      domainName: domainName,
      onTransactionHash: () => {
        setProcessStatus({
          type: ProcessStatusTypes.PROGRESS,
          render: <BaseText>Waiting for transaction confirmation</BaseText>,
        })
      },
      alias,
      commitment,
      makePublic,
    })

    if (activateResult.error) {
      const message =
        getEthersError(activateResult.error) || 'Please contact us'
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: <BaseText>Activation failed. {message}</BaseText>,
      })
      return result
    }

    setProcessStatus({
      type: ProcessStatusTypes.PROGRESS,
      render: 'Adding email alias',
    })

    const { success, error } = await easServerClient.activate(
      domainName,
      alias,
      forward,
      signature
    )

    if (error) {
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: (
          <BaseText>{`Activation failed. ${
            error
              ? `Error: ${error}`
              : 'Please email dot-country@hiddenstate.xyz for futher support'
          }`}</BaseText>
        ),
      })
      return result
    }

    if (success) {
      setProcessStatus({
        type: ProcessStatusTypes.SUCCESS,
        render: 'Activation complete!',
      })
      return true
    }
  } catch (ex) {
    log.error('renewCommand', {
      error: ex,
      domain: `${domainName.toLowerCase()}${config.tld}`,
      wallet: walletStore.walletAddress,
      alias: alias,
    })

    let errorMessage = getEthersError(ex)

    setProcessStatus({
      type: ProcessStatusTypes.ERROR,
      render: (
        <BaseText>{`Activation failed. ${
          ex
            ? `Error: ${errorMessage}`
            : 'Please email dot-country@hiddenstate.xyz for futher support'
        }`}</BaseText>
      ),
    })
  }

  return result
}

// function parseEmailInput(str: string): false | [string, string] {
//   const input = str.trim()
//   if (input.indexOf('email:') === 0) {
//     return parseEmailInput(input.split('email:')[1])
//   }

//   if (input.indexOf('=') !== -1) {
//     return parseEmailInput(input.replace('=', ' '))
//   }

//   if (isEmail(input)) {
//     return ['hello', input]
//   }

//   const [part1, part2] = input.split(' ')

//   if (!isEmail(part1) && isEmailId(part1) && isEmail(part2)) {
//     return [part1, part2]
//   }

//   if (isEmail(part1) && isEmail(part2)) {
//     const name = part1.split('@')[0]
//     return [name, part2]
//   }

//   return false
// }
