const createKeccakHash = require('keccak')

const SPECIAL_NAMES = ['0', '1']
// prettier-ignore

const RESERVED_NAMES = [
  ...SPECIAL_NAMES,
]

export const nameUtils = {
  RESTRICTED_VALID_NAME: /[a-z0-9]+/,
  VALID_NAME: /^[a-zA-Z0-9]{1,}((?!-)[a-zA-Z0-9]{0,}|-[a-zA-Z0-9]{1,})+$/,
  SPECIAL_NAMES: ['0', '1'],

  isValidName: (name: string) => {
    return nameUtils.VALID_NAME.test(name)
  },
  isReservedName: (name: string) => {
    return name.length <= 9 || RESERVED_NAMES.includes(name)
  },
}

export const utils = {
  hexView: (bytes: Uint8Array) => {
    return (
      bytes &&
      Array.from(bytes)
        .map((x) => x.toString(16).padStart(2, '0'))
        .join('')
    )
  },

  hexString: (bytes: Uint8Array) => {
    return '0x' + utils.hexView(bytes)
  },

  keccak: (bytes: Uint8Array) => {
    const k = createKeccakHash('keccak256')
    // assume Buffer is poly-filled or loaded from https://github.com/feross/buffer
    const hash = k.update(Buffer.from(bytes)).digest()
    return new Uint8Array(hash)
  },

  stringToBytes: (str: string) => {
    return new TextEncoder().encode(str)
  },

  keccak256: (str: string, use0x: boolean) => {
    const bytes = utils.stringToBytes(str)
    const hash = utils.keccak(bytes)
    return use0x ? utils.hexString(hash) : utils.hexView(hash)
  },
}

export type DomainLevel =
  | 'reserved'
  | 'legendary'
  | 'super_rare'
  | 'rare'
  | 'common'
export const getDomainLevel = (domainName: string): DomainLevel => {
  const len = domainName.length

  // if (len === 1) {
  //   return 'reserved'
  // }

  if (len === 1 || len === 2 || len === 3) {
    return 'legendary'
  }

  if (len <= 6) {
    return 'super_rare'
  }

  if (len <= 9) {
    return 'rare'
  }

  return 'common'
}

export const validateDomainName = (domainName: string) => {
  if (nameUtils.isReservedName(domainName.toLowerCase())) {
    return {
      valid: false,
      error: 'This domain name is reserved for special purpose',
    }
  }

  if (!nameUtils.isValidName(domainName.toLowerCase())) {
    return {
      valid: false,
      error: 'Domains can use a mix of letters and numbers',
    }
  }

  return {
    valid: true,
    error: '',
  }
}
