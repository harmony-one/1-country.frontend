import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import config from '../../config'
import fs from 'fs/promises'
import { chunk } from 'lodash'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()

  const name = '.1.country'
  const symbol = 'D1DC'
  const baseRentalPrice = ethers.utils.parseEther(config.baseRentalPrice)
  const rentalPeriod = config.rentalPeriod * 3600 * 24
  const priceMultiplier = config.priceMultiplier
  const revenueAccount = config.revenueAccount

  const D1DC = await deploy('D1DC', {
    from: deployer,
    args: [name, symbol, baseRentalPrice, rentalPeriod, priceMultiplier, revenueAccount],
    log: true,
    autoMine: true // speed up deployment on local network (ganache, hardhat), no effect on live networks
  })
  console.log('D1DC address:', D1DC.address)
  const d1dc = await ethers.getContractAt('D1DC', D1DC.address)
  if (!config.initialRecordFile) {
    await d1dc.finishInitialization()
    console.log('D1DC finished initialization')
    return
  }
  const records:{name:string, key: string, record: any[]}[] = JSON.parse(await fs.readFile(config.initialRecordFile, { encoding: 'utf-8' }))
  const chunks = chunk(records, 50)
  await d1dc.initialize([ethers.utils.id('')], [[ethers.constants.AddressZero, 0, 0, '', '', chunks[0][0].name]])
  for (const c of chunks) {
    const names = c.map(e => e.name)
    const records = c.map(e => [...e.record, '', ''])
    await d1dc.initialize(names, records)
  }
  await d1dc.finishInitialization()
  const n = parseInt(await d1dc.numRecords())
  console.log(n)
  console.log(`D1DC finished initialization for ${n} records`)

  const getRecords = async (keys:string[]) => {
    const recordsRaw = await Promise.all(keys.map(k => d1dc.nameRecords(k)))
    return recordsRaw.map(({ renter, timeUpdated, lastPrice, url, prev, next }) => {
      return {
        renter, timeUpdated: new Date(timeUpdated * 1000).toLocaleString(), lastPrice: ethers.utils.formatEther(lastPrice), url, prev, next
      }
    })
  }

  console.log(`key ${ethers.utils.id('')}, record:`, await getRecords([ethers.utils.id('')]))

  for (let i = 0; i < n; i += 50) {
    const keys = await d1dc.getRecordKeys(i, Math.min(n, i + 50))
    const records = await getRecords(keys)
    console.log(`Records ${i} to ${Math.min(n, i + 50)}: `, keys, records)
  }
}
export default func
func.tags = ['D1DC']
