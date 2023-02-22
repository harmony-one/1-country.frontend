import config from '../../config'

export const buildTxUri = (txHash: string) => {
  return config.explorer.replace('{{txId}}', txHash)
}
