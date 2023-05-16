import config from '../../config'
import { toBN } from 'web3-utils'
import { buildERC1155Uri } from '../utils/explorer'
import createKeccakHash from 'keccak'

const SPECIAL_NAMES = ['0', '1']
// prettier-ignore

const RESERVED_NAMES = [
  ...SPECIAL_NAMES,
]

const isRestricted = (name: string): boolean => {
  const phrases = config.domain.restrictedPhrases
  for (var i = 0; i < phrases.length; i++) {
    if (name.includes(phrases[i])) return true
  }
  return false
}

export const nameUtils = {
  RESTRICTED_VALID_NAME: /[a-z0-9]+/,
  VALID_NAME: /^[a-zA-Z0-9]{1,}((?!-)[a-zA-Z0-9]{0,}|-[a-zA-Z0-9]{1,})+$/,
  SPECIAL_NAMES: ['0', '1'],

  isValidName: (name: string) => {
    return nameUtils.VALID_NAME.test(name)
  },
  isValidLength: (name: string) => {
    return name.length < 64
  },
  isTaken: (name: string) => {
    return RESERVED_NAMES.includes(name)
  },
  isRestricted: (name: string) => {
    return isRestricted(name)
  },
  isReservedName: (name: string) => {
    return false;
    //name.length <= config.domain.reserved
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

  keccak: (bytes: Uint8Array | string) => {
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

  namehash: (name: string) => {
    const parts = name.split('.')
    const empty = new Uint8Array(32)
    if (!name) {
      return empty
    }
    let hash = empty
    for (let i = parts.length - 1; i >= 0; i--) {
      const joined = new Uint8Array(64)
      joined.set(hash)
      joined.set(utils.keccak(parts[i]), 32)
      hash = utils.keccak(joined)
    }
    return hash
  },

  buildTokenId: (domainName: string) => {
    return toBN(utils.hexString(utils.namehash(domainName))).toString()
  },

  buildDomainExplorerURI: (domainName: string) => {
    return buildERC1155Uri(
      config.nameWrapperContract,
      utils.buildTokenId(domainName)
    )
  },
  buildDomainImageURI: (domainName: string): string => {
    return `${config.domainNftImagesPath}/${domainName}.png`
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

  if (len <= config.domain.tiers.LEGENDARY) {
    // (len === 1 || len === 2 || len === 3) {
    return 'legendary'
  }

  if (len <= config.domain.tiers.SUPER_RARE) {
    return 'super_rare'
  }

  if (len <= config.domain.tiers.RARE) {
    return 'rare'
  }

  return 'common'
}

export const validateDomainName = (domainName: string) => {
  if (!nameUtils.isValidName(domainName.toLowerCase())) {
    return {
      valid: false,
      error: 'Domains can use a mix of letters and numbers', //Domains can use a mix of letters and numbers
    }
  }
  if (!nameUtils.isValidLength(domainName)) {
    return {
      valid: false,
      error: 'Domains must be under 64 characters long',
    }
  }
  if (nameUtils.isTaken(domainName.toLowerCase())) {
    return {
      valid: false,
      error: 'This domain name is reserved for special purpose',
    }
  }
  if (nameUtils.isRestricted(domainName.toLocaleLowerCase())) {
    return {
      valid: false,
      error: `${domainName} contains a restricted phrase and can't be registered`,
    }
  }
  if (nameUtils.isReservedName(domainName.toLowerCase())) {
    return {
      valid: false,
      error: `1 to ${config.domain.reserved} letter domains will be available soon`, // 'Available Soon',
    }
  }
  return {
    valid: true,
    error: '',
  }
}

export const daysBetween = (
  date1: string | number,
  date2: string | number
): number => {
  const DAY_MILLISECONDS = 1000 * 60 * 60 * 24
  return (Number(date2) - Number(date1)) / DAY_MILLISECONDS
}

export const getEthersError = (error: Error) => {
  // @ts-ignore
  const message = error.reason ? error.reason : error.message

  if (message) {
    return message
  }

  return ''
}
