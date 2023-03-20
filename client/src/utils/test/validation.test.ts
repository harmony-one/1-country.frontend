import { isRedditUrl, isValidInstagramUri, isValidTwitUri } from '../validation'

describe('valid twitter url', () => {
  it('returns null if host is not twitter', () => {
    expect(isValidTwitUri('https://google.com')).toEqual(null)
    expect(isValidTwitUri('https://1.country')).toEqual(null)
    expect(isValidTwitUri('https://tweeeeeeter.com')).toEqual(null)
  })

  it('returns null if status does not exist', () => {
    expect(isValidTwitUri('https://twitter.com/statis')).toEqual(null)
    expect(isValidTwitUri('https://twitter.com/stats')).toEqual(null)
    expect(isValidTwitUri('https://twitter.com/statoos/1234')).toEqual(null)
  })

  it('returns true if url matches the regex', () => {
    expect(isValidTwitUri('https://twitter.com/status/123')).toEqual(true)
    expect(isValidTwitUri('https://twitter.com/username/status/456')).toEqual(
      true
    )
    expect(
      isValidTwitUri('https://twitter.com/hello/world/status/789')
    ).toEqual(true)
  })
})

describe('valid instagram url', () => {
  it("returns false if '/p' is not included", () => {
    expect(isValidInstagramUri('https://instagram.com/helloworld')).toEqual(
      false
    )
  })

  it('returns false if id is below 4 characters', () => {
    expect(isValidInstagramUri('https://instagram.com/p/hi')).toEqual(false)
    expect(isValidInstagramUri('https://instagram.com/p/hey')).toEqual(false)
  })

  it('returns true if url matches the regex', () => {
    expect(isValidInstagramUri('https://instagram.com/p/helloworld')).toEqual(
      true
    )
    expect(isValidInstagramUri('https://instagram.com/p/helloworld')).toEqual(
      true
    )
  })
})

describe('valid reddit url', () => {
  it('returns true if url matches the regex', () => {
    expect(isRedditUrl('https://reddit.com/hello')).toEqual(true)
  })
})
