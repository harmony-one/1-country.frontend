import React, { useEffect, useState } from 'react'
// import { TwitterTimelineEmbed } from 'react-twitter-embed'
import { OwnerWidgetContainter } from './OwnerWidget.styles'
import { FacebookEmbed, InstagramEmbed, TwitterEmbed } from 'react-social-media-embed'

const OwnerWidget = ({ type, value }) => {
  const [appDomain, setAppDomain] = useState('')

  useEffect(() => {
    try {
      setAppDomain((new URL(value)).hostname)
      console.log(new URL(value))
    } catch (e) {
      console.log(e)
      setAppDomain('')
    }
  }, [])

  const getSocialMediaPost = () => {
    console.log('HERE I AM')
    const props = {
      url: value,
      width: 500
    }
    switch (appDomain) {
      case 'www.instagram.com':
        return <InstagramEmbed {...props} />
      case 'www.facebook.com':
        console.log('akkaak', value)
        return <FacebookEmbed {...props} /> // {...props} />)
      case 'twitter.com':
        return <TwitterEmbed {...props} />
    }
  }
  console.log('APP DOMAIN', appDomain)
  return (
    <OwnerWidgetContainter>
      {appDomain && getSocialMediaPost()}
      {/* {(type === 'twitter') && (
        <TwitterTimelineEmbed
          sourceType='profile'
          screenName={value}
          options={{ height: 600 }}
          placeholder='Loading...'
        />)} */}
    </OwnerWidgetContainter>
  )
}

export default OwnerWidget
