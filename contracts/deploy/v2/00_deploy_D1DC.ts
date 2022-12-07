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
  const symbol = 'D1DCV2'
  const baseRentalPrice = ethers.utils.parseEther(config.baseRentalPrice)
  const rentalPeriod = config.rentalPeriod * 3600 * 24
  const priceMultiplier = config.priceMultiplier
  const revenueAccount = config.revenueAccount
  const emailRevealPrice = ethers.utils.parseEther(config.emailRevealPrice)
  const phoneRevealPrice = ethers.utils.parseEther(config.phoneRevealPrice)
  const telegramRevealPrice = ethers.utils.parseEther(config.telegramRevealPrice)
  const emojiReactionPrice0 = ethers.utils.parseEther(config.emojiReactionPrice0)
  const emojiReactionPrice1 = ethers.utils.parseEther(config.emojiReactionPrice1)
  const emojiReactionPrice2 = ethers.utils.parseEther(config.emojiReactionPrice2)

  const D1DCV2 = await deploy("D1DCV2", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
    proxy: {
      proxyContract: "OpenZeppelinTransparentProxy",
      viaAdminContract: "DefaultProxyAdmin",
      execute: {
        init: {
          methodName: "initialize",
          args: [name, symbol, baseRentalPrice, rentalPeriod, priceMultiplier, revenueAccount, telegramRevealPrice, emailRevealPrice, phoneRevealPrice],
        },
      },
    },
  });
  console.log('D1DCV2 address:', D1DCV2.address)
  const d1dc = await ethers.getContractAt('D1DCV2', D1DCV2.address)

  // set the emoji prices
  await d1dc.setEmojiPrice(0, emojiReactionPrice0);
  await d1dc.setEmojiPrice(1, emojiReactionPrice1);
  await d1dc.setEmojiPrice(2, emojiReactionPrice2);

  // check the parameteres
  console.log('name: ', await d1dc.name())
  console.log('symbol: ', await d1dc.symbol())
  console.log('baseRentalPrice: ', (await d1dc.baseRentalPrice()).toString())
  console.log('rentalPeriod: ', (await d1dc.rentalPeriod()).toString())
  console.log('priceMultiplier: ', (await d1dc.priceMultiplier()).toString())
  console.log('revenueAccount: ', (await d1dc.revenueAccount()).toString())
  console.log('emailRevealPrice: ', (await d1dc.emailRevealPrice()).toString())
  console.log('phoneRevealPrice: ', (await d1dc.phoneRevealPrice()).toString())
  console.log('telegramRevealPrice: ', (await d1dc.telegramRevealPrice()).toString())
  console.log('emojiReactionPrice0: ', (await d1dc.emojiReactionPrices(0)).toString())
  console.log('emojiReactionPrice1: ', (await d1dc.emojiReactionPrices(1)).toString())
  console.log('emojiReactionPrice2: ', (await d1dc.emojiReactionPrices(2)).toString())

  // initialize
  if (!config.initialRecordFile) {
    await d1dc.finishNameInitialization()
    console.log('D1DCV2 finished initialization')
    return
  }
  const records:{name:string, key: string, record: any[]}[] = JSON.parse(await fs.readFile(config.initialRecordFile, { encoding: 'utf-8' }))
  const chunks = chunk(records, 50)
  await d1dc.initializeNames([ethers.utils.id('')], [[ethers.constants.AddressZero, 0, 0, '', '', chunks[0][0].name]])
  for (const c of chunks) {
    const names = c.map(e => e.name)
    const records = c.map(e => [...e.record, '', ''])
    await d1dc.initializeNames(names, records)
  }
  await d1dc.finishNameInitialization()
  const n = parseInt(await d1dc.numRecords())
  console.log(n)
  console.log(`D1DCV2 finished initialization for ${n} records`)

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
func.tags = ['D1DCV2']
