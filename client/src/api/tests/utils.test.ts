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
    expect(validateDomainName('1234567890')).toStrictEqual({
      valid: true,
      error: '',
    })
    expect(validateDomainName('foofoobarbar')).toStrictEqual({
      valid: true,
      error: '',
    })
  })
})
