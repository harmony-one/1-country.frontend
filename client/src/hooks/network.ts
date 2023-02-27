import { useNetwork, useAccount, useSwitchNetwork } from 'wagmi'
import { useEffect } from 'react'
import config from '../../config'

export const useDefaultNetwork = () => {
  const { chain } = useNetwork()
  const { switchNetwork } = useSwitchNetwork()
  const { isConnected } = useAccount()

  useEffect(() => {
    if (isConnected && switchNetwork && chain && chain.id !== config.chainParameters.id) {
      switchNetwork(config.chainParameters.id)
    }
  }, [chain, switchNetwork, isConnected])
}

export const useIsHarmonyNetwork = () => {
  const { chain } = useNetwork()
  return chain && chain.id === config.chainParameters.id
}
