import React from 'react'
import { CurationContainer } from '../Home.styles'
import bugSnapshot from '../../../../assets/images/snapshots/bug-snapshot.png'
import tokkisSnapshot from '../../../../assets/images/snapshots/tokkis-snapshot.png'
import mintbesSnapshot from '../../../../assets/images/snapshots/mintbes-snapshot.png'
import styled from 'styled-components'

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

const StyledImg = styled.img`
  max-width: 480px;
  max-height: 480px;
  object-fit: contain;
  width: 100%;
`

const PageCuration: React.FC<PageCuration> = ({ url, icon, img }) => {
  const clickHandler = () => {
    window.open(url, '_blank')
  }

  return (
    <CurationContainer
      onClick={clickHandler}
      style={{ marginTop: '2em', cursor: 'pointer' }}
    >
      <StyledImg src={img} loading="lazy" />
      {/* <span style={{ fontSize: '1.5rem' }}>{icon}</span> */}
    </CurationContainer>
  )
}

export default PageCuration
