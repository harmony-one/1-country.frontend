import React, { useState } from 'react'
import { TwitterTweetEmbed } from 'react-twitter-embed'
import { EmojiCounterContainer, baseEmojiListValues } from '../emoji/Emoji'

import { TweetContainerRow } from './TwitterSection.module'

// add EmojiList props
const TwitterSection = ({ tweetId, pageName, client }) => {
  // eslint-disable-next-line array-bracket-spacing
  const [emojiList, ] = useState(baseEmojiListValues)
  // const [emojiList, setEmojiList] = useState(baseEmojiListValues)

  return (
    <TweetContainerRow>
      <TwitterTweetEmbed tweetId={tweetId} />
      <EmojiCounterContainer emojiList={emojiList} pageName={pageName} client={client} />
    </TweetContainerRow>
  )
}

export default TwitterSection
