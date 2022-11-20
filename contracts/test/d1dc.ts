// import { expect } from "chai";
import { ethers } from 'hardhat'

const name = '.1.country'
const symbol = 'D1DC'
const baseRentalPrice = 100
const rentalPeriod = 90
const priceMultiplier = 2

describe('D1DC', function () {
  it('Should be deployed', async function () {
    const D1DC = await ethers.getContractFactory('D1DC')
    const d1dc = await D1DC.deploy(name, symbol, baseRentalPrice, rentalPeriod, priceMultiplier)
    await d1dc.deployed()
    console.log(`D1DC.address: ${d1dc.address}`)
  })
})
