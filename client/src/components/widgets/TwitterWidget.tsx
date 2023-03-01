/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useState } from 'react'
import { TwitterTimelineEmbed, TwitterTweetEmbed } from 'react-twitter-embed'
import { useInView } from 'react-intersection-observer'
import isUrl from 'is-url'

import { DeleteWidgetButton, WidgetsContainer } from './Widgets.styles'
import { parseTweetId } from '../../utils/parseTweetId'
import { CloseCircle } from '../icons/CloseCircle'
import { Skeleton } from 'grommet/components/Skeleton'
import { Box } from 'grommet/components/Box'

const TwitterWidgetDefault = {
  tweetId: '',
  error: '',
}

type ParseInputValueResult =
  | { value: string; error: null }
  | { error: string; value: null }

export const parseInputValue = (value: string): ParseInputValueResult => {
  try {
    if (isUrl(value)) {
      const result = parseTweetId(value)
      return result.tweetId
        ? {
            value: result.tweetId,
            error: null,
          }
        : {
            value: null,
            error: result.error,
          }
    } else {
      return {
        value: value,
        error: null,
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

interface Props {
  value: string
  isOwner?: boolean
  onDelete: () => void
}

export const Placeholder: React.FC = () => {
  return (
    <Box fill="horizontal" direction="row" skeleton gap="24px">
      <Box>
        <Skeleton round="48px" width="48px" height="48px" />
      </Box>
      <Box fill="horizontal" gap="8px">
        <Skeleton round="12px" />
        <Skeleton round="12px" />
        <Skeleton round="12px" height="100px" />
      </Box>
    </Box>
  )
}

const TwitterWidget: React.FC<Props> = ({ value, isOwner, onDelete }) => {
  const [tweetId, setTweetId] = useState<{ tweetId?: string; error?: string }>(
    TwitterWidgetDefault
  )
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

  return (
    <WidgetsContainer isWidgetLoading={loading} ref={ref}>
      <div style={{ paddingBottom: '2em' }}>
        {userName && (!loading || inView) && (
          <TwitterTimelineEmbed
            sourceType="profile"
            screenName={userName}
            options={{ height: 600, width: 550 }}
            placeholder={<Placeholder />}
            key={`${userName}`}
            onLoad={() => setLoading(false)}
          />
        )}
        {tweetId.tweetId && (!loading || inView) && (
          <TwitterTweetEmbed
            tweetId={tweetId.tweetId}
            key={`${tweetId.tweetId}`}
            placeholder={<Placeholder />}
            options={{ height: 600, width: 550 }}
            onLoad={() => setLoading(false)}
          />
        )}
      </div>
      {isOwner && (
        <DeleteWidgetButton onClick={onDelete}>
          <CloseCircle />
        </DeleteWidgetButton>
      )}
    </WidgetsContainer>
  )
}

export default TwitterWidget
