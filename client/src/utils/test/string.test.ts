import { cutString } from '../string'

describe('cut string', () => {
  it('returns the input if length is short', () => {
    expect(cutString('')).toEqual('')
    expect(cutString('hello')).toEqual('hello')
    expect(cutString('harmony')).toEqual('harmony')
  })

  it('returns the cut string if length is long', () => {
    expect(cutString('killerwhale')).toEqual('kille...whale')
    expect(cutString('tyrannosaurus')).toEqual('tyran...aurus')
    expect(cutString('0x00000000000000000000000000000000000000fc')).toEqual(
      '0x000...000fc'
    )
  })
})
