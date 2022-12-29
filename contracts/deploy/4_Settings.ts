import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { Contract } from '@ethersproject/contracts'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre
  const { deploy, get } = deployments

  const { deployer } = await getNamedAccounts()

  // get AddressRegistry contract
  const addressRegistryContract: Contract = await ethers.getContract('AddressRegistry')
  const d1dcV2Contract: Contract = await ethers.getContract('D1DCV2');

  // get the contracts deployed
  const d1dcV2 = await get("D1DCV2")
  const vanityURL = await get("VanityURL")

  // register the contracts deployed to AddressRegistry contract
  await addressRegistryContract.setD1DCV2(d1dcV2.address)
  await addressRegistryContract.setVanityURL(vanityURL.address)

  console.log('AddressRegistry set done')
}
export default func
func.tags = ['Settings']
