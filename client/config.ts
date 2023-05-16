const debug = process.env.DEBUG

const config = {
  debug,
  sentryDSN: process.env.SENTRY_DSN || '',
  backendHost:
    process.env.BACKEND_HOST || 'https://mdo-dcobackend-01.t.hmny.io',
  registrar:
    process.env.REGISTRAR_RELAYER ||
    'https://1ns-registrar-relayer.hiddenstate.xyz',
  postContract:
    process.env.POST_CONTRACT_ADDRESS ||
    '0xE47D600c4A833b3A0E7B6B18ee8e6A7D2FF93818',
  contract:
    process.env.CONTRACT || '0x547942748Cc8840FEc23daFdD01E6457379B446D',
  tweetContractAddress:
    process.env.TWEET_CONTRACT_ADDRESS ||
    '0x17cF877f9226ba382b0baDA1499576E60A547955',
  ews: {
    contract:
      process.env.EWS_CONTRACT || '0x067B394Cbd08D08e565f886DEFDE906A7E42FB93',
    server: process.env.EWS_SERVER ?? 'https://1ns-embedder.hiddenstate.xyz',
  },
  nameWrapperContract:
    process.env.NAME_WRAPPER_CONTRACT ||
    '0x4cd2563118e57b19179d8dc033f2b0c5b5d69ff5',
  eas: {
    contract:
      process.env.EAS_CONTRACT || '0xDBf0D70070D760512d214C7ccaB933e066eeb070',
    apiHost:
      process.env.EAS_API_HOST || 'https://1ns-eas-server.hiddenstate.xyz',
    message(sld: string, alias: string, forwardAddress: string): string {
      return `You are about to authorize forwarding all emails sent to [${alias}@${sld}${config.tld}] to [${forwardAddress}] instead`
    },
  },
  explorer: {
    explorerUrl:
      process.env.EXPLORER_URL || 'https://explorer.harmony.one/#/tx/',
    address: 'https://explorer.harmony.one/address/',
    tx: 'https://explorer.harmony.one/tx/',
    block: 'https://explorer.harmony.one/block/',
    erc1155: 'https://explorer.harmony.one/inventory/erc1155/',
  },
  defaultRPC: process.env.DEFAULT_RPC || 'https://api.harmony.one',
  hostname: process.env.REACT_APP_BASE_URL || 'https://localhost:3100',
  tld: process.env.TLD || '.dev.1.localhost:3100', // '.country',
  tldLink: process.env.TLD_LINK || 'dev.1.localhost:3100', // '1.country',
  domainNftImagesPath:
    'https://storage.googleapis.com/radical-domain-nft-images',
  betteruptime: {
    heartbeatId: process.env.HEARTBEAT_ID,
  },
  walletConnect: {
    projectId:
      process.env.WALLETCONNECT_PROJECTID || '151b401583f027040cd047500ae283e8',
  },
  vanityUrl: {
    price: 0,
    contractVanityURL:
      process.env.VANITY_URL_CONTRACT ||
      '0xc8288E9cC4159B83f6510b7F3103e25f2cc4CA30', // https://github.com/harmony-one/.1.country/blob/v1.1/contracts/deployments/mainnet/VanityURL_Proxy.json
  },
  domain: {
    tiers: {
      LEGENDARY: Number(process.env.TIER_LEGENDARY) || 1,
      SUPER_RARE: Number(process.env.TIER_SUPER_RARE) || 6,
      RARE: Number(process.env.TIER_RARE) || 9,
      COMMON: Number(process.env.TIER_COMMON) || 10,
    },
    reserved: Number(process.env.DOMAIN_RESERVED_LENGTH) || 6,
    restrictedPhrases: process.env.RESTRICTED_PHRASES
      ? process.env.RESTRICTED_PHRASES.split(', ')
      : ['metamask', 'walletconnect'],
    expirationReminderDays: process.env.EXPIRATION_REMAINDER_DAYS || 30,
    renewalLimit: Number(process.env.RENEWAL_LIMIT) || 90, // one time
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
