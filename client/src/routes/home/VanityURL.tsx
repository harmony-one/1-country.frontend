import React, { useEffect } from 'react'
import { useAccount } from 'wagmi'
import { toast } from 'react-toastify'
import { useStores } from '../../stores'
import { observer } from 'mobx-react-lite'
import { DomainRecord } from '../../api'

// mind that react router redirects after initialization to base /
const currentPath = window.location.pathname.replace('/', '')
const isSetOperation = currentPath.includes('=')
const keys = isSetOperation ? currentPath.split('=') : null

console.log('### VanityUrl', { isSetOperation, keys })
interface Props {
  record: DomainRecord
  name: string
}

export const VanityURL: React.FC<Props> = observer(({ record, name }) => {
  // const pageAddress = record ? record.renter : null

  const { connector } = useAccount()

  console.log('### connector', connector)

  const { walletStore, rootStore } = useStores()
  // const isOwner =
  //   walletStore.walletAddress &&
  //   pageAddress &&
  //   pageAddress.toLowerCase() === walletStore.walletAddress.toLowerCase()

  useEffect(() => {
    if (!name || isSetOperation) {
      return
    }

    const call = async () => {
      const redirectURL = await rootStore.vanityUrlClient.getUrl({
        name,
        aliasName: currentPath,
      })
      if (redirectURL) {
        window.location.href = redirectURL
      }
    }
    currentPath && call()
  }, [name])

  // add/update VanityUrl from URL
  // useEffect(() => {
  //   console.log('### isOwner', isOwner)
  //   console.log('### isConnected', walletStore.isConnected)
  //   if (!isOwner || !walletStore.isConnected) {
  //     return
  //   }

  //   const call = async () => {
  //     console.log('### keys', keys)
  //     if (!keys) {
  //       return
  //     }

  //     console.log('### currentAlias')
  //     const key = keys[0]
  //     const value = keys[1]
  //     const currentAlias = await api.checkURLValidity(name, key)

  //     if (!value && currentAlias) {
  //       // remove alias
  //       try {
  //         console.log('### delete url')

  //         await api.deleteURL(connector, walletStore.walletAddress, name, key)
  //         toast.success('URL removed')
  //       } catch (e) {
  //         toast.error(e.message)
  //       }
  //       return
  //     }

  //     if (!currentAlias) {
  //       // create
  //       try {
  //         console.log('### setNew URL')
  //         await api.setNewURL(
  //           connector,
  //           walletStore.walletAddress,
  //           name,
  //           key,
  //           value
  //         )
  //         toast.success('URL created')
  //       } catch (e) {
  //         toast.error(e.message)
  //       }
  //     } else {
  //       // update
  //       try {
  //         console.log('### updateUrl')

  //         await api.updateURL(
  //           connector,
  //           walletStore.walletAddress,
  //           name,
  //           key,
  //           value
  //         )
  //         toast.success('URL updated')
  //       } catch (e) {
  //         toast.error(e.message)
  //       }
  //     }
  //   }

  //   call()
  // }, [isOwner, walletStore.isConnected])

  return <></>
})
