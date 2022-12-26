import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import config from '../config'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()

  const addressRegistry = await get("AddressRegistry");

  const urlUpdatePrice = config.urlUpdatePrice
  // const urlUpdatePrice = ethers.utils.parseEther(config.urlUpdatePrice)

  const VanityURL = await deploy("VanityURL", {
    from: deployer,
    args: [],
    log: true,
    proxy: {
      proxyContract: "OpenZeppelinTransparentProxy",
      viaAdminContract: "DefaultProxyAdmin",
      execute: {
        init: {
          methodName: "initialize",
          args: [addressRegistry.address, urlUpdatePrice],
        },
      },
    },
  });
  console.log('VanityURL address:', VanityURL.address)
}
export default func
func.tags = ['VanityURL']
