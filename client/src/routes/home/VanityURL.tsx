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

  return <></>
})
