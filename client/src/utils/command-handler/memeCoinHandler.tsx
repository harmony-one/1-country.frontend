import {
  ProcessStatusItem,
  ProcessStatusTypes,
} from '../../components/process-status/ProcessStatus'
import { RootStore } from '../../stores/RootStore'
import { WalletStore } from '../../stores/WalletStore'
import { BaseText } from '../../components/Text'
import React from 'react'
import { CreateTokenForm } from '../../api/bonding-curve/types'

interface MemeCoinHandlerProps {
  formData: CreateTokenForm
  rootStore: RootStore
  walletStore: WalletStore
  setProcessStatus: React.Dispatch<React.SetStateAction<ProcessStatusItem>>
}

export const memeCoinHandler = async ({
  formData,
  rootStore,
  walletStore,
  setProcessStatus,
}: MemeCoinHandlerProps): Promise<boolean> => {
  try {
    let result = false
    const tokenApi = rootStore.tokenApiClient
    // Upload metadata first
    setProcessStatus({
      type: ProcessStatusTypes.PROGRESS,
      render: 'Uploading token metadata...',
    })

    const metadataPayload = {
      userAddress: walletStore.walletAddress,
      name: formData.name,
      symbol: formData.symbol,
      description: formData.description,
      image: formData.image,
    }

    const metadataUrl = await tokenApi.addTokenMetadata(metadataPayload)

    // Create token contract
    setProcessStatus({
      type: ProcessStatusTypes.PROGRESS,
      render: 'Minting contract...',
    })

    const txHash = await tokenApi.createToken({
      name: formData.name,
      symbol: formData.symbol,
      metadataUrl,
      onTransactionHash: () => {
        setProcessStatus({
          type: ProcessStatusTypes.PROGRESS,
          render: <BaseText>Waiting for transaction confirmation</BaseText>,
        })
      },
      onSuccess: () => {
        result = true
        setProcessStatus({
          type: ProcessStatusTypes.SUCCESS,
          render: <BaseText>Domain unwrap completed</BaseText>,
        })
      },
      onFailed: (ex: Error) => {
        console.log('safeTransfer ERROR', ex)
        setProcessStatus({
          type: ProcessStatusTypes.ERROR,
          render: <BaseText>Domain unwrap failed</BaseText>,
        })
      },
    })
    console.log('FCO::::::::::::: ', txHash)
    return result
    //  writeContract(config, {
    //   address: appConfig.tokenFactoryAddress,
    //   abi: TokenFactoryABI,
    //   functionName: 'createToken',
    //   args: [formData.name, formData.symbol, metadataUrl]
    // })

    // setProcessStatus({
    //   type: ProcessStatusTypes.PROGRESS,
    //   render: 'Contract minted, waiting for confirmation...'
    // })

    // const receipt = await waitForTransactionReceipt(config, {
    //   hash: txHash,
    //   confirmations: 6
    // })

    // setProcessStatus({
    //   type: ProcessStatusTypes.PROGRESS,
    //   render: 'Transaction confirmed, waiting for indexer...'
    // })

    // // Wait for indexer to pick up the token
    // let tokenAddress: string | undefined

    // for (let i = 0; i < 20; i++) {
    //   await new Promise(resolve => setTimeout(resolve, 500))
    //   const tokens = await getTokens({ search: txHash })
    //   if (tokens.length === 1) {
    //     tokenAddress = tokens[0].address
    //     break
    //   }
    // }

    // if (!tokenAddress) {
    //   throw new Error('Failed to confirm token creation')
    // }

    // return tokenAddress
  } catch (error) {
    console.error('memeCoinHandler failed:', error)
    throw error
  }
}
