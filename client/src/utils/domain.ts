export const calcDomainUSDPrice = (price: number, oneRate: number) => {
  return price * oneRate
}

export const formatONEAmount = (num: number | string) => {
  const twoDecimalsFormatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: num > 1000 ? 0 : num < 100 ? 2 : 1,
  })

  return twoDecimalsFormatter.format(Number(num))
}

export const formatUSDAmount = (num: string | number) => {
  const twoDecimalsFormatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: num > 100 ? 1 : num < 10 ? 3 : 2,
  })

  return twoDecimalsFormatter.format(Number(num))
}
