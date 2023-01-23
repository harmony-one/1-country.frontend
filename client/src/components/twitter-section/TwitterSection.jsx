import React from 'react'
import { TwitterTweetEmbed } from 'react-twitter-embed'
import { EmojiCounterContainer } from '../emoji/Emoji'

import { TweetContainerRow } from './TwitterSection.styles'

// add EmojiList props
const TwitterSection = ({ tweetId, pageName, client }) => {
  // eslint-disable-next-line array-bracket-spacing
  // const [emojiList, setEmojiList] = useState(baseEmojiListValues)

  return (
    <TweetContainerRow>
      <TwitterTweetEmbed tweetId={tweetId} />
      <EmojiCounterContainer pageName={pageName} client={client} />
    </TweetContainerRow>
  )
}

export default TwitterSection
