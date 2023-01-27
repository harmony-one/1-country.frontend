import React, { useEffect, useState } from 'react'
import AppBlock from '../app-block/AppBlock'
import { APPS } from './AppGallery.data'
import { AppGalleryDiv, AppGalleryItem } from './AppGallery.styles'
import { WidgetDirectSell } from '../../routes/home/components/WidgetSellProduct'
import { WidgetUserText } from '../../routes/home/components/WidgetUserText'
import { WidgetNFT } from '../../routes/home/components/WidgetNFT'

const AppGallery = () => {
  const [appList, setAppList] = useState([])

  useEffect(() => {
    setAppList(APPS)
  }, [])

  return (
    <AppGalleryDiv>
      <WidgetDirectSell />
      <WidgetUserText />
      <AppGalleryItem row='span 2'>
        <WidgetNFT />
      </AppGalleryItem>
      {appList.length > 0 &&
        appList.map((app, index) => (
          <AppBlock src={app.img} url={app.url} alt={app.alt} key={index} />
        ))}
    </AppGalleryDiv>
  )
}

export default AppGallery
