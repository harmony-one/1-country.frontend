import React, { useEffect, useState } from 'react'
import * as api from '../../api/vanityURL'
import { useAccount } from 'wagmi'
import { toast } from 'react-toastify'

// mind that react router redirects after initialization to base /
const currentPath = window.location.pathname.replace('/', '')
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const urlParamsKeys = urlParams.keys()

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
    if (!name || !currentPath) {
      return
    }

    const call = async () => {
      const redirectURL = await api.getURL(name, currentPath)
      if (redirectURL) {
        window.location.href = redirectURL
      }
    }

    call()
  }, [name])

  useEffect(() => {
    if (!isOwner || !isConnected) {
      return
    }

    const call = async () => {
      for (const key of urlParamsKeys) {
        const value = urlParams.getAll(key)[0]
        const currentAlias = await api.checkURLValidity(name, key)

        if (!value && currentAlias) {
          // remove alias
          try {
            await api.deleteURL(connector, address, name, key)
            toast.success('URL removed')
          } catch (e) {
             toast.error(e.message)
          }
          continue
        }

        if (!currentAlias) {
          // create
          try {
            await api.setNewURL(connector, address, name, key, value)
            toast.success('URL created')
          } catch (e) {
             toast.error(e.message)
          }
        } else {
          // update
          try {
            await api.updateURL(connector, address, name, key, value)
            toast.success('URL updated')
          } catch (e) {
            toast.error(e.message)
          }
        }

      }
    }

    call()
  }, [isOwner, isConnected])

  return <></>
}
