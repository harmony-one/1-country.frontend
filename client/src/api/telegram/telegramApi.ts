import axios from 'axios'
import config from '../../../config'

const BOT_TOKEN = config.telegram.telegramBotAuthToken
// const url = 'http://localhost:3001/telegramApi' local testing
const url = `https://api.telegram.org/bot${BOT_TOKEN}`

const base = axios.create({
  baseURL: url,
  timeout: 10000,
  headers: {
    accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

export interface GetFileResult {
  file_id: string
  file_path: string
  file_size: number
  file_unique_id: string
}

export const telegramApi = {
  getImageInfo: async (fileId: string): Promise<GetFileResult> => {
    try {
      const { data } = await base.post('/getFile', { file_id: fileId })
      return data.result
    } catch (e) {
      console.log(e)
      return null
    }
  },
  getImgUrl: (filePath: string): string => {
    return `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`
  },
}
