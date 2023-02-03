import React, {useEffect, useState} from 'react'
import {observer} from "mobx-react-lite";
import AppBlock from '../app-block/AppBlock'
import {APPS} from './AppGallery.data'
import {AppGalleryDiv, AppGalleryItem} from './AppGallery.styles'
import {WidgetDirectSell} from '../../routes/home/components/WidgetSellProduct'
import {WidgetUserText} from '../../routes/home/components/WidgetUserText'
import {WidgetNFT} from '../../routes/home/components/WidgetNFT'
import {WidgetCreator} from '../../routes/home/components/WidgetCreator'
import {useStores} from "../../stores";
import {WidgetType} from "../../stores/WidgetsStore";
import {WidgetText} from "../../routes/home/components/WidgetText";

const AppGallery: React.FC = observer(() => {
  const [appList, setAppList] = useState([])

  const {domainRecordStore, widgetsStore} = useStores();

  useEffect(() => {
    setAppList(APPS)
  }, [])

  return (
    <AppGalleryDiv>
      {widgetsStore.widgets.map((widget, index) => {
        if (widget.type === WidgetType.TEXT) {
          return <WidgetText key={index} widget={widget} />
        }

        return null;
      })}
      {domainRecordStore.isOwner && <WidgetCreator />}
      <WidgetDirectSell />
      <WidgetUserText />
      <AppGalleryItem row='span 2'>
        <WidgetNFT
          price={100}
          preview='https://i.seadn.io/gae/xvo_23hMeLYQ2SaNaDIhSvgKRLWIbFiSSigLDk1dqG1W6CT7zSUWBzfZrj06g7jskdYML7kMO5KE-OvDhBdEWV1SI19urbatIXfrmA4?auto=format&w=750'
        />
      </AppGalleryItem>
      <WidgetNFT
        price={100}
        preview='https://ik.imagekit.io/bayc/assets/ape1.png'
      />
      {appList.length > 0 &&
        appList.map((app, index) => (
          <AppBlock src={app.img} url={app.url} alt={app.alt} key={index} />
        ))}
    </AppGalleryDiv>
  )
})

export default AppGallery
