import axios from 'axios'
import config from '../../config'

export const appHealthy = async (status: string) => {
  axios
    .post(
      `https://betteruptime.com/api/v1/heartbeat/${config.betteruptime.heartbeatId}/submit`,
      {
        status: status,
      }
    )
    .catch((err) => {
      console.log(err)
    })
}
