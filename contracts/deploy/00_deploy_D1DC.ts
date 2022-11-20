import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()

  const name = '.1.country'
  const symbol = 'D1DC'
  const baseRentalPrice = 100
  const rentalPeriod = 90 * 3600 * 24
  const priceMultiplier = 2

  const d1dc = await deploy('D1DC', {
    from: deployer,
    args: [name, symbol, baseRentalPrice, rentalPeriod, priceMultiplier],
    log: true,
    autoMine: true // speed up deployment on local network (ganache, hardhat), no effect on live networks
  })
  console.log('D1DC address:', d1dc.address)
}
export default func
func.tags = ['D1DC']
