import React from 'react'
import { TwitterTweetEmbed } from 'react-twitter-embed'
import { TweetContainerRow } from '../../routes/home/Home.styles'
import { EmojiContainer } from '../emoji/Emoji'

const TwitterSection = ({ tweetId }) => {
  return (
    <TweetContainerRow>
      <TwitterTweetEmbed tweetId={tweetId} />
      <EmojiContainer />
    </TweetContainerRow>
  )
}

export default TwitterSection
