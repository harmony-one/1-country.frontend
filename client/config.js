const debug = process.env.DEBUG

const config = {
  debug,
  burnerContract: process.env.BURNER_CONTRACT || (debug ? '0x9BC52FBcCcde8cEADAEde51a25dBeD489b201e53' : '0x476e14D956dca898C33262aecC81407242f8431A'),
  previousBurnerContracts: JSON.parse(process.env.PREVIOUS_BURNER_CONTRACTS || '[]'),
  explorer: process.env.EXPLORER_URL || 'https://explorer.harmony.one/#/tx/{{txId}}',
  defaultRPC: process.env.DEFAULT_RPC || 'https://api.harmony.one',
  disabledAssets: JSON.parse(process.env.DISABLED_ASSETS || '[]'),
  supportedAssets: process.env.SUPPORTED_ASSETS
    ? JSON.parse(process.env.SUPPORTED_ASSETS)
    : [
        debug ? '0xe3BCFeeE8a783F1c107C71385652dC2Ac0662598' : '0x985458E523dB3d53125813eD68c274899e9DfAb4',
      ],
  chainParameters: process.env.CHAIN_PARAMETERS
    ? JSON.parse(process.env.CHAIN_PARAMETERS)
    : {
        chainId: '0x63564C40', // A 0x-prefixed hexadecimal string
        chainName: 'Harmony Mainnet Shard 0',
        nativeCurrency: {
          name: 'ONE',
          symbol: 'ONE',
          decimals: 18
        },
        rpcUrls: ['https://api.harmony.one'],
        blockExplorerUrls: ['https://explorer.harmony.one/']
      }
}

export default config
