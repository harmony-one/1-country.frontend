import qs from 'qs'

export const getDomainName = () => {
  if (!window) {
    return null
  }

  const { _domain = '' } = qs.parse(window.location.search, {
    ignoreQueryPrefix: true,
  })

  // console.log('getSubDomain()', window.location.host)
  const host = (_domain as string) || window.location.host
  const parts = host.split('.')
  if (parts.length <= 2) {
    return ''
  }
  if (parts.length <= 4) {
    // 3 CHANGE FOR PRODUCTION
    return parts[0]
  }
  return parts.slice(0, parts.length - 2).join('.')
}
