import React, { useEffect } from 'react'
import { useStores } from '../stores'
import { useSearchParams } from 'react-router-dom'

interface Props {}

export const Bootstrap: React.FC<Props> = () => {
  const { utilsStore } = useStores()

  const [searchParams] = useSearchParams()

  useEffect(() => {
    const referral = searchParams.get('referral')

    if (searchParams.get('referral')) {
      utilsStore.saveReferral(referral)
    }
  }, [])

  return null
}

Bootstrap.displayName = 'Bootstrap'
