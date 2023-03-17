import { parseTweetId } from '../parseTweetId'

describe('parse tweet id', () => {
  it('returns bad form for different url host', () => {
    const url = 'https://www.google.com/'
    const result = parseTweetId(url)
    expect(result.tweetId).toEqual(undefined)
    expect(result.error).toEqual('URL must be from https://twitter.com')
  })

  it('returns bad form for with just twitter', () => {
    const url = 'https://twitter.com/'
    const result = parseTweetId(url)
    expect(result.tweetId).toEqual(null)
    expect(result.error).toEqual(
      'URL has bad form. It must be https://twitter.com/[some_account]/status/[tweet_id]'
    )
  })

  it('returns bad form for without status', () => {
    const url = 'https://twitter.com/abc/status'
    const result = parseTweetId(url)
    expect(result.tweetId).toEqual(null)
    expect(result.error).toEqual(
      'URL has bad form. It must be https://twitter.com/[some_account]/status/[tweet_id]'
    )
  })

  it('returns bad form for with bad status', () => {
    const url = 'https://twitter.com/abc/status/def'
    const result = parseTweetId(url)
    expect(result.tweetId).toEqual(null)
    expect(result.error).toEqual('cannot parse tweet id')
  })

  it('returns tweet id with valid twitter url', () => {
    const url = 'https://twitter.com/harmonyprotocol/status/1636138600365719552'
    const result = parseTweetId(url)
    const expected = '1636138600365719552'
    console.log('[XXX] ID:' + result.tweetId)
    console.log('[XXX] ERROR:' + result.error)

    expect(result.tweetId).toBe(expected)
    expect(result.error).toEqual(null)
  })
})
