import React from 'react'
import { TwitterTimelineEmbed } from 'react-twitter-embed'
import { OwnerWidgetContainter } from './OwnerWidget.styles'
const OwnerWidget = ({ type, value }) => {
  return (
    <OwnerWidgetContainter>

      {(type === 'twitter') && (
        <TwitterTimelineEmbed
          sourceType='profile'
          screenName={value}
          options={{ height: 600 }}
          placeholder='Loading...'
          // onLoad={() => setLoading(true)}
        />)}

    </OwnerWidgetContainter>
  )
}

export default OwnerWidget
