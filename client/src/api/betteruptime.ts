import axios from 'axios'
import config from '../../config'

export const appHealthy = async () => {
  axios
    .get(
      `https://betteruptime.com/api/v1/heartbeat/${config.betteruptime.heartbeatId}`
    )
    .catch((err) => {
      console.log(err)
    })
}
