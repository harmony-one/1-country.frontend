export const calcDomainUSDPrice = (price: number, oneRate: number) => {
  return price * oneRate
}

export const formatONEAmount = (num: number | string) => {
  const twoDecimalsFormatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: num < 1 ? 2 : 0,
  })

  return twoDecimalsFormatter.format(Number(num))
}

export const formatUSDAmount = (num: string | number) => {
  const twoDecimalsFormatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })

  return twoDecimalsFormatter.format(Number(num))
}
