import { buildTxUri } from '../explorer'

describe('build transaction URI', () => {
  const explorerURL = 'https://explorer.harmony.one/tx/'

  it('genesis txid', () => {
    const txHash =
      '0xdfeff1fba1aeed89fb75ef4ee9bf9e0fca1ff9b26d78d471565bf151f965274b'
    const actual = buildTxUri(txHash)
    const expected = explorerURL + txHash

    expect(actual).toEqual(expected)
  })
})
