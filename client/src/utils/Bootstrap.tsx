import React, { useEffect } from 'react'
import { useStores } from '../stores'
import qs from 'qs'

interface Props {}

const getReferralId = (queryString: string): string => {
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
  const { utilsStore } = useStores()

  useEffect(() => {
    const referral = getReferralId(window.location.search)

    if (referral) {
      utilsStore.saveReferral(referral)
    }
  }, [])

  return null
}

Bootstrap.displayName = 'Bootstrap'
