export const cutString = (str: string, len = 5) => {
  if (typeof str !== 'string') {
    return ''
  }

  if (str.length < len * 2) {
    return str
  }

  return `${str.slice(0, len)}...${str.slice(str.length - len)}`
}
