import React, { useEffect, useState } from 'react'
import * as api from '../../api/vanityURL'
import { useAccount } from 'wagmi'

/* redirect for vanity URLS
import * as api from '../api/vanityURL'

export const checkVanityURL = () => {
  const alias = window.location.pathname
  const redirect = 'https://ya.ru'

  // window.location.href = redirect
}
*/

// mind that react router redirects after initialization to base /
const currentPath = window.location.pathname
console.log({currentPath})

export const VanityURL = ({
  record // page information
}) => {

  const pageAddress = record ? record.renter : null
  const { isConnected, address, connector } = useAccount()
  const isOwner =
    address &&
    pageAddress &&
    pageAddress.toLowerCase() === address.toLowerCase()

  console.log('VanityURL', {address, pageAddress, isOwner})

  useEffect(() => {
    if (!pageAddress) {
      return
    }

    const call = async () => {
      const res = await api.getURL(pageAddress, currentPath)
      console.log({res})
    }

    call()
  }, [pageAddress])

  return <></>
}
