/* eslint-disable node/no-unpublished-import */
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { parseEther } from 'ethers/lib/utils'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()

  const baseRentalPrice = 100
  const rentalPeriod = 90
  const priceMultiplier = 2

  await deploy('OneCountryManager', {
    from: deployer,
    args: [baseRentalPrice, rentalPeriod, priceMultiplier],
    log: true,
    autoMine: true // speed up deployment on local network (ganache, hardhat), no effect on live networks
  })
}
export default func
func.tags = ['OneCountryManager']
