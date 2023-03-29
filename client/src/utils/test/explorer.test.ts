import { buildTxUri, buildERC1155Uri } from '../explorer'

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

describe('buildERC1155Uri', () => {
  it('should build explorer URI', () => {
    const actual01 = buildERC1155Uri('0x00', '0123')
    expect(actual01).toEqual(
      'https://explorer.harmony.one/inventory/erc1155/0x00/0123'
    )
    const actual02 = buildERC1155Uri(
      '0x4cd2563118e57b19179d8dc033f2b0c5b5d69ff5',
      '42510714903874480647532813492312774551776211999634354675326405870688679082223'
    )
    expect(actual02).toEqual(
      'https://explorer.harmony.one/inventory/erc1155/0x4cd2563118e57b19179d8dc033f2b0c5b5d69ff5/42510714903874480647532813492312774551776211999634354675326405870688679082223'
    )
  })
})
