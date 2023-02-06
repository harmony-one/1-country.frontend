import React, { useEffect, useState } from 'react'
import OwnerWidget from '../owner-widget/OwnerWidget'
import AddWidget from './AddWidget'

const PageWidgets = ({ isOwner }) => {
  const [widgetList, setWidgetList] = useState([])

  const LIST = [
    {
      type: '',
      value: 'https://www.facebook.com/andrewismusic/posts/451971596293956'
    },
    {
      type: '',
      value: 'https://www.instagram.com/p/CUbHfhpswxt/'
    }
  ]

  useEffect(() => {
    setWidgetList(LIST)
  }, [])
  return (
    <div>
      {widgetList.length > 0 && (
        widgetList.map((widget, index) =>
          <OwnerWidget type={widget.type} value={widget.value} key={index} />)
      )}
      {isOwner && <AddWidget list={widgetList} setList={setWidgetList} />}
    </div>
  )
}

export default PageWidgets
