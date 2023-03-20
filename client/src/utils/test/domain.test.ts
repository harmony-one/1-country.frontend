import { calcDomainUSDPrice, formatONEAmount } from '../domain'

describe('util test with USD and ONE', () => {
  it('calculates the domain USD price', () => {
    const price = 100
    const oneRate = 0.02
    const actual = calcDomainUSDPrice(price, oneRate)
    const expected = 2

    expect(actual).toEqual(expected)
  })

  it('formats ONE amount', () => {
    const input = 100.2000002
    const actual = formatONEAmount(input)
    const expected = '100'

    expect(actual).toEqual(expected)
  })

  it('formats ONE amount with decimal place', () => {
    const input = 0.005
    const actual = formatONEAmount(input)
    const expected = '0.01'

    expect(actual).toEqual(expected)
  })

  it('formats USD amount', () => {
    const input = 100.6
    const actual = formatONEAmount(input)
    const expected = '101'

    expect(actual).toEqual(expected)
  })
})
