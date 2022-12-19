import React from 'react'
import { TwitterTweetEmbed } from 'react-twitter-embed'
import { EmojiCounterContainer } from '../emoji/Emoji'

import { TweetContainerRow } from './TwitterSection.module'

// add EmojiList props
const TwitterSection = ({ tweetId, pageName, client }) => {
  // eslint-disable-next-line array-bracket-spacing
  // const [emojiList, setEmojiList] = useState(baseEmojiListValues)

  return (
    <TweetContainerRow>
      <TwitterTweetEmbed tweetId={tweetId} />
      {/* uncomment the line below to reveal the emojis */}
      {/* <EmojiCounterContainer pageName={pageName} client={client} /> */}
    </TweetContainerRow>
  )
}

export default TwitterSection
