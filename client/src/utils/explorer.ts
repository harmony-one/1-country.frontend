import config from '../../config'

export const buildTxUri = (txHash: string) => {
  return config.explorer.tx + txHash
}
export const buildERC1155Uri = (
  contractAddress: string,
  tokenId: string | number
) => {
  return `${config.explorer.erc1155}${contractAddress}/${tokenId}`
}
