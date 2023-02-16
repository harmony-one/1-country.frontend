import qs from 'qs'

export const getDomainName = () => {
  if (!window) {
    return null
  }

  const { _domain = '' } = qs.parse(window.location.search, {
    ignoreQueryPrefix: true,
  })

  const host = (_domain as string) || window.location.host
  const parts = host.split('.')
  if (parts.length < 2) {
    return ''
  }

  // reserved domains for landing pages
  if (['names', '0', '1'].includes(parts[0])) {
    return ''
  }

  return parts[0]
}
