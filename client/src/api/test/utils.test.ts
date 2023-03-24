import { nameUtils } from '../utils'
import { utils } from '../utils'
import { getDomainLevel } from '../utils'
import { validateDomainName } from '../utils'

describe('Testing nameUtils', () => {
  test('isValidName', () => {
    expect(nameUtils.isValidName('**foo:)')).toBe(false)
    expect(nameUtils.isValidName('openconsensus.country')).toBe(false)
    expect(nameUtils.isValidName('123456789')).toBe(true)
    expect(nameUtils.isValidName('openconsensus')).toBe(true)
  })
  test('isTaken', () => {
    expect(nameUtils.isTaken('0')).toBe(true)
    expect(nameUtils.isTaken('openconsensus')).toBe(false)
  })
})

describe('Testing utils', () => {
  test('hexView', () => {
    expect(utils.hexView(new Uint8Array(2))).toBe('0000')
  })
  test('hexString', () => {
    expect(utils.hexString(new Uint8Array(2))).toBe('0x0000')
  })
  // test('keccak', () => {
  //     expect(utils.keccak(new Uint8Array(2))).toBe("foo")
  // });
  // test('stringToBytes', () => {
  //     expect(utils.stringToBytes("foo")).toBe([102, 111, 111])
  // });
  test('keccak256', () => {
    expect(utils.keccak256('foo', false)).toBe(
      '41b1a0649752af1b28b3dc29a1556eee781e4a4c3a1f7f53f90fa834de098c4d'
    )
  })
})

describe('Testing getDomainLevel', () => {
  test('getDomainLevel', () => {
    expect(getDomainLevel('1')).toBe('legendary')
    expect(getDomainLevel('11111')).toBe('super_rare')
    expect(getDomainLevel('11111111')).toBe('rare')
    expect(getDomainLevel('1111111111')).toBe('common')
    expect(getDomainLevel('11111111111111111111')).toBe('common')
  })
})

describe('Testing validateDomainName', () => {
  test('validateDomainName', () => {
    expect(validateDomainName('1')).toStrictEqual({
      valid: false,
      error: 'This domain name is reserved for special purpose',
    })
    expect(validateDomainName('****foo****')).toStrictEqual({
      valid: false,
      error: 'Domains can use a mix of letters and numbers',
    })
    expect(validateDomainName('seven.country')).toStrictEqual({
      valid: false,
      error: 'Domains can use a mix of letters and numbers',
    })
    expect(validateDomainName('!@#')).toStrictEqual({
      valid: false,
      error: 'Domains can use a mix of letters and numbers',
    })
    expect(validateDomainName('1234567890')).toStrictEqual({
      valid: true,
      error: '',
    })
    expect(validateDomainName('foofoobarbar')).toStrictEqual({
      valid: true,
      error: '',
    })
    expect(validateDomainName('x'.repeat(64))).toStrictEqual({
      valid: false,
      error: 'Domains must be under 64 characters long',
    })
  })
})

describe('namehash', () => {
  it('should generate namehash', () => {
    expect(utils.namehash('1.country')).toEqual(
      new Uint8Array([
        244, 76, 57, 94, 212, 222, 77, 183, 122, 43, 99, 220, 209, 6, 189, 196,
        49, 53, 115, 252, 24, 115, 72, 69, 61, 92, 217, 130, 94, 128, 235, 151,
      ])
    )
  })
})

describe('buildTokenId', () => {
  it('should build token id', () => {
    expect(utils.buildTokenId('solidity.country')).toEqual(
      '57595320814075724957818091352505671515796480954782416012489579000260146841601'
    )
    expect(utils.buildTokenId('polygon.country')).toEqual(
      '20694283288589844340016925037199172343245066114203336972659187450793467060874'
    )
  })
})
