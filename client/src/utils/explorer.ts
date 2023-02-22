import config from '../../config'

export const buildTxUri = (txHash: string) => {
  return config.explorer.explorerUrl.replace('{{txId}}', txHash)
}
