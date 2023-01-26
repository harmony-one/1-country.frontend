import React, { useEffect, useState } from 'react'
import AppBlock from '../app-block/AppBlock'
import { APPS } from './AppGallery.data'
import { AppGalleryDiv } from './AppGallery.styles'
import { WidgetDirectSell } from '../../routes/home/components/WidgetSellProduct'
import { WidgetUserText } from '../../routes/home/components/WidgetUserText'

const AppGallery = () => {
  const [appList, setAppList] = useState([])

  useEffect(() => {
    setAppList(APPS)
  }, [])

  return (
    <AppGalleryDiv>
      <WidgetDirectSell />
      <WidgetUserText />
      {appList.length > 0 &&
        appList.map((app, index) => (
          <AppBlock src={app.img} url={app.url} alt={app.alt} key={index} />
        ))}
    </AppGalleryDiv>
  )
}

export default AppGallery
