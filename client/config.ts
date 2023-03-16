const debug = process.env.DEBUG

const config = {
  debug,
  backendHost:
    process.env.BACKEND_HOST || 'https://mdo-dcobackend-01.t.hmny.io',
  contract:
    process.env.CONTRACT || '0xeFC73fB07660464aA03A5790D011DA0512c5854f',
  tweetContractAddress:
    process.env.TWEET_CONTRACT_ADDRESS || '0x17cF877f9226ba382b0baDA1499576E60A547955',
  contractVanityURL:
    process.env.CONTRACT_VANITY_URL ||
    '0x88a1afC4134f385337Dd5F530D452079fC9E14CC', // https://github.com/harmony-one/.1.country/blob/v1.1/contracts/deployments/mainnet/VanityURL_Proxy.json
  explorer: {
    explorerUrl:
      process.env.EXPLORER_URL || 'https://explorer.harmony.one/#/tx/{{txId}}',
    address: 'https://explorer.harmony.one/address/',
    tx: 'https://explorer.harmony.one/tx/',
    block: 'https://explorer.harmony.one/block/',
  },
  defaultRPC: process.env.DEFAULT_RPC || 'https://api.harmony.one',
  hostname: process.env.REACT_APP_BASE_URL || 'https://localhost:3100',
  tld: process.env.TLD || '.dev.1.localhost:3100', // '.1.country',
  tldLink: process.env.TLD_LINK || 'dev.1.localhost:3100', // '1.country',
  walletConnect: {
    projectId:
      process.env.WALLETCONNECT_PROJECTID || '151b401583f027040cd047500ae283e8',
  },
  domain : {
    tiers : {
      RESERVED: process.env.TIER_RESERVED || 1,
      LEGENDARY: process.env.TIER_LEGENDARY || 3,
      SUPER_RARE: process.env.TIER_SUPER_RARE || 6,
      RARE: process.env.TIER_RARE || 9,
      COMMON: process.env.TIER_COMMON || 10
    }, 
    reserved : process.env.DOMAIN_RESERVED_LENGTH || 9
  },
  emojiType: {
    ONE_ABOVE: 0,
    FIRST_PRIZE: 1,
    ONE_HUNDRED_PERCENT: 2,
  },
  emojiTypePrice: {
    ONE_ABOVE: 1,
    FIRST_PRIZE: 2,
    ONE_HUNDRED_PERCENT: 3,
  },
  infoRevealPrice: {
    email: 1,
    phone: 2,
    telegram: 4,
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
          default: {
            http: ['https://api.harmony.one'],
          },
        },
        blockExplorers: {
          default: { name: 'Explorer', url: 'https://explorer.harmony.one/' },
        },
        testnet: true,
      },
  payments: {
    apiUrl: process.env.PAYMENTS_API_URL || 'http://localhost:3001',
  },
  embedly: {
    host: 'https://api.embedly.com',
    key: process.env.EMBEDLY_API_KEY,
  },
}

export default config
