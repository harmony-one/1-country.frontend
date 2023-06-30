const substackUrlRegExp =
  /^https:\/\/[a-zA-Z0-9-]+.substack.com(\/|\/[/.a-zA-Z0-9-_#]+)?$/
const substackLandingUrlRegExp = /^https:\/\/[a-zA-Z0-9-]+.substack.com(\/?)$/
export const isValidSubstackLandingUrl = (str: string) =>
  substackLandingUrlRegExp.test(str)
export const isValidSubstackUrl = (str: string) => substackUrlRegExp.test(str)
export function parseSubstackUrl(urlStr: string): URL | null {
  if (!urlStr?.startsWith('https://') && !urlStr?.startsWith('http://')) {
    return parseSubstackUrl(`https://${urlStr}`)
  }
  try {
    const url = new URL(urlStr)
    if (!url.host.endsWith('.substack.com')) {
      console.error(`${url} is not with substack.com`)
      return null
    }
    return url
  } catch (ex: any) {
    console.error(ex)
    return null
  }
}
