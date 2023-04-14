import React, { useEffect, useState } from 'react'
import { useStores } from '../stores'
import isValidUrl from 'is-url'
import qs from 'qs'

interface Props {}

const getParamName = (queryString: string): string => {
  const queryParams = qs.parse(queryString, {
    ignoreQueryPrefix: true,
  })

  return Object.entries(queryParams).reduce((pv, [name, value]) => {
    if (value === '') {
      return name
    }

    return pv
  }, '')
}

export const Bootstrap: React.FC<Props> = () => {
  const { utilsStore, domainStore } = useStores()
  const { domainName } = domainStore

  useEffect(() => {
    const paramName = getParamName(window.location.search)
    if (domainName === '') {
      if (paramName) {
        utilsStore.saveReferral(paramName)
      }
    } else {
      if (paramName && isValidUrl(paramName)) {
        utilsStore.post = paramName
      }
    }
  }, [])

  return null
}

Bootstrap.displayName = 'Bootstrap'
