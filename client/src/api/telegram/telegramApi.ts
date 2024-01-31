import axios from 'axios'
import config from '../../../config'

const BOT_TOKEN = config.telegram.telegramBotAuthToken
const url = `https://api.telegram.org/bot${BOT_TOKEN}`

const base = axios.create({
  baseURL: url,
  timeout: 10000,
  headers: {
    accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

export const telegramApi = {
  getImageInfo: async (fileId: string): Promise<any> => {
    const { data } = await base.post('/getFile', { data: { file_id: fileId } })
    console.log(data)
    return data
  },
  getImgUrl: (filePath: string): string => {
    return `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`
  },
}
