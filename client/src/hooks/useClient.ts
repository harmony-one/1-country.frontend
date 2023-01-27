import {useEffect, useState} from "react";
import Web3 from "web3";
import config from "../../config";
import apis from "../api";
import {useAccount} from "wagmi";


export const useClient = () => {
  // @ts-expect-error
  const [client, setClient] = useState(apis({}))

  const { address, connector } = useAccount()

  useEffect(() => {
    const web3 = new Web3(config.defaultRPC)
    const api = apis({ web3, address })
    setClient(api)
  }, [])

  useEffect(() => {
    const callApi = async () => {
      const provider = await connector.getProvider()
      const web3 = new Web3(provider)
      const api = apis({ web3, address })
      setClient(api)
    }
    if (connector && address) {
      callApi()
    }
  }, [connector, address])

  return [client];
}