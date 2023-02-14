export const calcDomainUSDPrice = (domainName: string) => {
  const len = domainName.length

  if (len <= 3) {
    return 100
  }

  if (len <= 6) {
    return 10
  }

  if (len <= 9) {
    return 1
  }

  return 0.01
}

export const calDomainOnePrice = (
  domainName: string,
  oneUsdRate = 0.02588853
) => {
  const priceUsd = calcDomainUSDPrice(domainName)

  return priceUsd / oneUsdRate
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
