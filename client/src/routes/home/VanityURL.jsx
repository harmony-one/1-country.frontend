import React, { useEffect, useState } from 'react'
import * as api from '../../api/vanityURL'
import { useAccount } from 'wagmi'
import { toast } from 'react-toastify'

// mind that react router redirects after initialization to base /
const currentPath = window.location.pathname.replace('/', '')
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const urlParamsKeys = urlParams.keys()

console.log('VanityURL',{currentPath})

export const VanityURL = ({
  record, // page information,
  name // subdomain name
}) => {

  const pageAddress = record ? record.renter : null

  const { isConnected, address, connector } = useAccount()
  const isOwner =
    address &&
    pageAddress &&
    pageAddress.toLowerCase() === address.toLowerCase()

  useEffect(() => {
    console.log('VanityURL',{name})
    if (!name) {
      return
    }

    const call = async () => {
      const redirectURL = await api.getURL(name, currentPath)
      console.log('VanityURL',{redirectURL})
      if (redirectURL) {
        window.location.href = redirectURL
      }
    }

    call()
  }, [name, connector])

  useEffect(() => {
    if (!isOwner) {
      return
    }

    const call = async () => {
      for (const key of urlParamsKeys) {
        const value = urlParams.getAll(key)[0]
        const currentAlias = await api.getURL(name, key)

        if (!value) {
          // remove alias
          try {
            const newAlias = await api.deleteURL(connector, address, name, key)
            toast.success('URL removed')
          } catch (e) {
             toast.error(e.message)
          }
          continue
        }

        if (!currentAlias) {
          // create
          try {
            const newAlias = await api.setNewURL(connector, address, name, key, value)
            toast.success('URL created')
          } catch (e) {
             toast.error(e.message)
          }
        } else {
          // update
          try {
            const newAlias = await api.updateURL(connector, address, name, key, value)
            toast.success('URL updated')
          } catch (e) {
            toast.error(e.message)
          }
        }

      }
    }

    call()
  }, [isOwner])

  return <></>
}
