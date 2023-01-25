export const truncateAddressString = (address, num = 12) => {
  if (!address) {
    return ''
  }
  const first = address.slice(0, num)
  const last = address.slice(-num)
  return `${first}...${last}`
}
