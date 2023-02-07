import React, { useEffect } from 'react'

const OpenWidgets = () => {
  useEffect(() => {
    const checkSubdomain = () => {
      console.log('getSubDomain()', window.location.host)
      const host = window.location.host
      const parts = host.split('.')
      console.log(host, parts, parts.length)
      if (parts.length <= 2) {
        return false
      }
      if (parts.length <= 4) { // 3 CHANGE FOR PRODUCTION
        return true
      }
    }
    if (checkSubdomain) {
      console.log('hi')
    }
    // setUrl('https://twitter.com/harmonyprotocol/status/1619034491280039937?s=20&t=0cZ38hFKKOrnEaQAgKddOg')
    // setName(getSubdomain())
    // const web3 = new Web3(config.defaultRPC)
    // const api = apis({ web3, address })
    // setClient(api)
  }, [])

  return (
    <div>Open Widget</div>
  )
}

export default OpenWidgets
