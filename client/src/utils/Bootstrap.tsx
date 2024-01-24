import React, { useEffect, useState } from 'react'
import { useStores } from '../stores'

interface Props {}

export const Bootstrap: React.FC<Props> = () => {
  const { utilsStore, domainStore } = useStores()
  const { domainName } = domainStore

  useEffect(() => {
    const query = window.location.search.slice(1)

    console.log('command', query)

    if (domainName === '') {
      if (query) {
        utilsStore.saveReferral(query)
      }
    } else {
      if (query) {
        utilsStore.command = query
      }
    }
  }, [])

  return null
}

Bootstrap.displayName = 'Bootstrap'
