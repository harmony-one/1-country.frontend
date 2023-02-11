/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useState } from 'react'
import { TwitterTimelineEmbed, TwitterTweetEmbed } from 'react-twitter-embed'
import { useInView } from "react-intersection-observer";
import { IoMdCloseCircle } from 'react-icons/io'
import isUrl from 'is-url'
import BN from 'bn.js'

import { DeleteWidgetButton, WidgetsContainer } from './Widgets.styles'

export const WIDGET_TYPE = {
  feed: 0,
  post: 1
}

const parseBN = (n) => {
  try {
    return new BN(n)
  } catch (ex) {
    console.error(ex)
    return null
  }
}

const parseTweetId = (urlInput) => {
  try {
    const url = new URL(urlInput)
    if (url.host !== 'twitter.com') {
      return { error: 'URL must be from https://twitter.com' }
    }
    const parts = url.pathname.split('/')
    const BAD_FORM = {
      error:
        'URL has bad form. It must be https://twitter.com/[some_account]/status/[tweet_id]',
    }
    if (parts.length < 2) {
      return BAD_FORM
    }
    if (parts[parts.length - 2] !== 'status') {
      return BAD_FORM
    }
    const tweetId = parseBN(parts[parts.length - 1])
    if (!tweetId) {
      return { error: 'cannot parse tweet id' }
    }
    return { tweetId: tweetId.toString() }
  } catch (ex) {
    console.error(ex)
    return { error: ex.toString() }
  }
}
const TwitterWidgetDefault = {
  tweetId: '',
  error: ''
}
const TwitterWidget = ({ value, widgetKey, deleteWidget }) => {
  const [tweetId, setTweetId] = useState(TwitterWidgetDefault)
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)
  const { ref, inView } = useInView({
    /* Optional options */
    rootMargin: "0px",
    root: null,
    threshold: 0.1,
  });

  useEffect(() => {
    setLoading(true)
    if (isUrl(value)) {
      setTweetId(parseTweetId(value))
      setUserName('')
    } else {
      setUserName(value)
      setTweetId(TwitterWidgetDefault)
    }
  }, [value])

  const deleteItem = () => {
    deleteWidget(value)
  }

  return (
    <WidgetsContainer isWidgetLoading={loading} ref={ref}>
      <div style={{ paddingBottom: '2em' }}>
        {userName && (!loading || inView) && (
          <TwitterTimelineEmbed
            sourceType='profile'
            screenName={userName}
            options={{ height: 600 }}
            placeholder='Loading...'
            key={`${userName}`}
            onLoad={() => setLoading(false)}
          />
        )}
        {tweetId.tweetId && (!loading || inView) && (
          <TwitterTweetEmbed
            tweetId={tweetId.tweetId}
            key={`${tweetId.tweetId}`}
            placeholder='Loading...'
            onLoad={() => setLoading(false)}
          />)}
      </div>
      <DeleteWidgetButton onClick={deleteItem}>
        <IoMdCloseCircle />
      </DeleteWidgetButton>
    </WidgetsContainer>
  )
}

export default TwitterWidget
