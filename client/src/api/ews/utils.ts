export const getSld = (): string => {
  if (!window) {
    return ''
  }
  const host = window.location.host
  const parts = host.split('.')
  if (parts.length <= 1) {
    return ''
  }
  return parts[parts.length - 2]
}

export const getSubdomain = (): string => {
  if (!window) {
    return ''
  }
  const host = window.location.host
  const parts = host.split('.')
  if (parts.length <= 2) {
    return ''
  }
  return parts[parts.length - 3]
}

export const getPath = (): string => {
  if (!window) {
    return ''
  }
  return window.location.pathname
}
