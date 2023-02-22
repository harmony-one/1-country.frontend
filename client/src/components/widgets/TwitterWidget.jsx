/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useState } from 'react'
import { TwitterTimelineEmbed, TwitterTweetEmbed } from 'react-twitter-embed'
import { useInView } from 'react-intersection-observer'
import isUrl from 'is-url'

import { DeleteWidgetButton, WidgetsContainer } from './Widgets.styles'
import { parseTweetId } from '../../utils/parseTweetId'
import { IconClose } from '../icons/Close'

export const WIDGET_TYPE = {
  feed: 0,
  post: 1,
}

const TwitterWidgetDefault = {
  tweetId: '',
  error: '',
}

export const checkTweet = (value) => {
  try {
    if (isUrl(value)) {
      const result = parseTweetId(value)
      return result.tweetId
        ? {
            value: result.tweetId,
            type: WIDGET_TYPE.post,
            error: null,
          }
        : {
            value: null,
            error: result.error,
          }
    } else {
      return {
        value: value,
        type: WIDGET_TYPE.feed,
      }
    }
  } catch (e) {
    console.log(e)
    return {
      value: null,
      error: e,
    }
  }
}

const TwitterWidget = ({ value, type, deleteWidget }) => {
  const [tweetId, setTweetId] = useState(TwitterWidgetDefault)
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)
  const { ref, inView } = useInView({
    /* Optional options */
    rootMargin: '0px',
    root: null,
    threshold: 0.1,
  })

  useEffect(() => {
    setLoading(true)
    if (isUrl(value)) {
      setTweetId(parseTweetId(value))
      setUserName('')
    } else if (/^[0-9]+$/.test(value)) {
      setTweetId({ tweetId: value })
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
            sourceType="profile"
            screenName={userName}
            options={{ height: 600, width: 550 }}
            placeholder="Loading..."
            key={`${userName}`}
            onLoad={() => setLoading(false)}
          />
        )}
        {tweetId.tweetId && (!loading || inView) && (
          <TwitterTweetEmbed
            tweetId={tweetId.tweetId}
            key={`${tweetId.tweetId}`}
            placeholder="Loading..."
            options={{ height: 600, width: 550 }}
            onLoad={() => setLoading(false)}
          />
        )}
      </div>
      <DeleteWidgetButton onClick={deleteItem}>
        <IconClose />
      </DeleteWidgetButton>
    </WidgetsContainer>
  )
}

export default TwitterWidget
