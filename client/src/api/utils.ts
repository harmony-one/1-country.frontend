const createKeccakHash = require('keccak')

export const nameUtils = {
  RESTRICTED_VALID_NAME: /[a-z0-9]+/,
  VALID_NAME: /[a-z0-9-]+/,
  SPECIAL_NAMES: ['s', '0', '1', 'li', 'ml', 'ba'],
  isValidName: (name: string) => {
    return nameUtils.VALID_NAME.test(name)
  },
  isReservedName: (name: string) => {
    name = name.toLowerCase()
    return (
      name.length <= 2 &&
      nameUtils.RESTRICTED_VALID_NAME.test(name) &&
      !nameUtils.SPECIAL_NAMES.includes(name)
    )
  },
}

export const utils = {
  hexView: (bytes) => {
    return (
      bytes &&
      Array.from(bytes)
        .map((x) => x.toString(16).padStart(2, '0'))
        .join('')
    )
  },

  hexString: (bytes) => {
    return '0x' + utils.hexView(bytes)
  },

  keccak: (bytes) => {
    const k = createKeccakHash('keccak256')
    // assume Buffer is poly-filled or loaded from https://github.com/feross/buffer
    const hash = k.update(Buffer.from(bytes)).digest()
    return new Uint8Array(hash)
  },

  stringToBytes: (str) => {
    return new TextEncoder().encode(str)
  },

  keccak256: (str, use0x) => {
    const bytes = utils.stringToBytes(str)
    const hash = utils.keccak(bytes)
    return use0x ? utils.hexString(hash) : utils.hexView(hash)
  },

  hexToBytes: (hex, length, padRight) => {
    if (!hex) {
      return
    }
    length = length || hex.length / 2
    const ar = new Uint8Array(length)
    for (let i = 0; i < hex.length / 2; i += 1) {
      let j = i
      if (padRight) {
        j = length - hex.length + i
      }
      ar[j] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
    }
    return ar
  },

  hexStringToBytes: (hexStr, length) => {
    return hexStr.startsWith('0x')
      ? utils.hexToBytes(hexStr.slice(2), length)
      : utils.hexToBytes(hexStr, length)
  },

  tryNormalizeAddress: (address) => {
    try {
      return web3.utils.toChecksumAddress((address || '').toLowerCase())
    } catch (ex) {
      console.error(ex)
      return null
    }
  },

  ecrecover: (message, signature) => {
    try {
      return web3.eth.accounts.recover(message, signature)
    } catch (ex) {
      console.error(ex)
      return null
    }
  },
}
