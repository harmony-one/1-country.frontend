import React from 'react'
import { SmallTextGrey } from '../../../components/Text'

interface Props {}

export const HomePageFooter: React.FC<Props> = () => {
  return (
    <SmallTextGrey>
      <a href="https://harmony.one/domains" rel="noreferrer">
        <SmallTextGrey>
          {' '}
          Harmony's Creator Economy & Web3 Nations{' '}
        </SmallTextGrey>
      </a>
    </SmallTextGrey>
  )
}
