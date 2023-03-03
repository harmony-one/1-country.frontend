import axios from 'axios'
import config from '../../../config'

const embedlyApi = axios.create({
  baseURL: config.embedly.host,
  headers: { 'Content-Type': 'application/json' },
})

const embedlyKey = config.embedly.key

export const loadEmbedJson = async (url: string) => {
  const { data } = await embedlyApi.get(
    `/1/oembed?url=${url}&key=${embedlyKey}`
  )
  return data
}
