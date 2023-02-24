import BN from 'bn.js'

const parseBN = (n: string | number) => {
  try {
    return new BN(n)
  } catch (ex) {
    console.error(ex)
    return null
  }
}

export type ParseTweetIdResult =
  | { tweetId: string; error: null }
  | { tweetId: null; error: string }

export const parseTweetId = (urlInput: string): ParseTweetIdResult => {
  try {
    const url = new URL(urlInput)
    if (url.host !== 'twitter.com') {
      return {
        error: 'URL must be from https://twitter.com',
        tweetId: undefined,
      }
    }
    const parts = url.pathname.split('/')
    const BAD_FORM: ParseTweetIdResult = {
      error:
        'URL has bad form. It must be https://twitter.com/[some_account]/status/[tweet_id]',
      tweetId: null,
    }
    if (parts.length < 2) {
      return BAD_FORM
    }
    if (parts[parts.length - 2] !== 'status') {
      return BAD_FORM
    }
    const tweetId = parseBN(parts[parts.length - 1])
    if (!tweetId) {
      return { error: 'cannot parse tweet id', tweetId: null }
    }
    return { tweetId: tweetId.toString(), error: null }
  } catch (ex) {
    console.error(ex)
    return { error: ex.toString(), tweetId: null }
  }
}
