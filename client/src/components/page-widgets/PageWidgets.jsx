import React, { useState } from 'react'
import OwnerWidget from '../owner-widget/OwnerWidget'
import AddWidget from './AddWidget'

const PageWidgets = () => {
  const [widgetList, setWidgetList] = useState([])

  return (
    <div>
      {widgetList.length > 0 && (
        widgetList.map((widget, index) =>
          <OwnerWidget type={widget.type} value={widget.value} key={index} />)
      )}
      <AddWidget list={widgetList} setList={setWidgetList} />
    </div>
  )
}

export default PageWidgets
