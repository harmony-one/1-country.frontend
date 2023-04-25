import React from 'react'
import { FlexColumn } from '../../../components/Layout'
import bugSnapshot from '../../../../assets/images/snapshots/bug-snapshot.png'
import tokkisSnapshot from '../../../../assets/images/snapshots/tokkis-snapshot.png'
import mintbesSnapshot from '../../../../assets/images/snapshots/mintbes-snapshot.png'

type PageCuration = {
  url: string
  icon: string
  img: any
}

export const PAGE_CURATION_LIST = [
  {
    url: 'https://bug.country/',
    img: bugSnapshot,
    icon: '🪲',
  },
  {
    url: 'https://tokkis.country/',
    img: tokkisSnapshot,
    icon: '🐰',
  },
  {
    url: 'https://mintbes.country/',
    img: mintbesSnapshot,
    icon: '🌿',
  },
]

const PageCuration: React.FC<PageCuration> = ({ url, icon, img }) => {
  const clickHandler = () => {
    window.open(url, '_blank')
  }

  return (
    <FlexColumn
      onClick={clickHandler}
      style={{ marginTop: '2em', cursor: 'pointer' }}
    >
      <span style={{ fontSize: '1.5rem' }}>{icon}</span>
      <img src={img} />
    </FlexColumn>
  )
}

export default PageCuration
