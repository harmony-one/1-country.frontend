const twitterStatusRegex = /\/status(es)?\/(\d+)/

export function isValidTwitUri(uri: string) {
  const _url = new URL(uri)

  if (_url.host !== 'twitter.com') {
    return null
  }

  if (_url.pathname.indexOf('status') === -1) {
    return null
  }

  const match = twitterStatusRegex.exec(_url.pathname)
  return match !== null
}

const instagramRegex =
  /^(https?:\/\/)?(www\.)?instagram.com\/p\/[a-zA-Z0-9]{4,20}\/?/

export function isValidInstagramUri(uri: string) {
  return instagramRegex.test(uri)
}
