import cookie from 'js-cookie'
import { COOKIES } from './src/constants'

const debug = process.env.DEBUG

const config = {
  debug,
  console: {
    hideErrors:
      parseInt(process.env.CONSOLE_HIDE_ERRORS, 10) === 1 &&
      parseInt(cookie.get(COOKIES.HIDE_ERRORS), 10) !== 0,
  },
  sentryDSN: process.env.SENTRY_DSN || '',
  backendHost:
    process.env.BACKEND_HOST || 'https://mdo-dcobackend-01.t.hmny.io',
  freeRentBackendHost:
    process.env.FREE_RENT_BACKEND_HOST || 'https://1-country-openapi.fly.dev',
  registrar:
    process.env.REGISTRAR_RELAYER ||
    'https://1ns-registrar-relayer.hiddenstate.xyz',
  postContract:
    process.env.POST_CONTRACT_ADDRESS ||
    '0x3Ca62ea311B21AA98ac52762e57436AF965e344d',
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
    '0x4Cd2563118e57B19179d8DC033f2B0C5B5D69ff5',
  domainTransfer: {
    baseRegitrarAddress:
      process.env.BASE_REGISTRAR_ADDRESS ||
      '0x4D64B78eAf6129FaC30aB51E6D2D679993Ea9dDD',
    resolverAddress:
      process.env.RESOLVER_ADDRESS ||
      '0x46E37034Ffc87a969d1a581748Acf6a94Bc7415D',
  },
  eas: {
    contract:
      process.env.EAS_CONTRACT || '0x2394070E16dFDF21cb8c7606bD88FFED105D5F0f',
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
  hostname: process.env.BASE_URL || 'https://localhost:3100',
  tld: process.env.TLD || '.dev.1.localhost:3100', // '.country',
  tldLink: process.env.TLD_LINK || 'dev.1.localhost:3100', // '1.country',
  domainMetadataPath: 'https://storage.googleapis.com/radical-domain-metadata',
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
  qrURL: process.env.QR_URL || 'https://s3.amazonaws.com/1.country/qr',
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

console.log('### config', config)
export default config
