const debug = process.env.DEBUG

const config = {
  debug,
  contract: process.env.CONTRACT || '0x3cC3C5F98AC3FF544279919DfceBfb7aFe03A2cA', // (debug ? '0x9BC52FBcCcde8cEADAEde51a25dBeD489b201e53' : '0x476e14D956dca898C33262aecC81407242f8431A'),
  explorer: process.env.EXPLORER_URL || 'https://explorer.harmony.one/#/tx/{{txId}}',
  defaultRPC: process.env.DEFAULT_RPC || 'https://api.harmony.one',
  tld: process.env.TLD || '.dev.1.country', // '.1.country',
  tldLink: process.env.TLD_LINK || '.dev.1.country', // '1.country',
  emojiType: {
    ONE_ABOVE: 0,
    FIRST_PRIZE: 1,
    ONE_HUNDRED_PERCENT: 2
  },
  emojiTypePrice: {
    ONE_ABOVE: 1,
    FIRST_PRIZE: 2,
    ONE_HUNDRED_PERCENT: 3
  },
  infoRevealPrice: {
    email: 1,
    phone: 2,
    telegram: 4
  },
  chainParameters: process.env.CHAIN_PARAMETERS
    ? JSON.parse(process.env.CHAIN_PARAMETERS)
    : {
        id: 1666600000, // '0x63564C40'
        name: 'Harmony Mainnet Shard 0',
        network: 'harmony',
        nativeCurrency: {
          decimals: 18,
          name: 'ONE',
          symbol: 'ONE',
        },
        rpcUrls: {
          default: 'https://api.harmony.one',
        },
        blockExplorers: {
          default: { name: 'Explorer', url: 'https://explorer.harmony.one/' },
        },
        testnet: true,
      }
}

export default config
