// import { expect } from "chai";
import { ethers } from 'hardhat'

const token = '1.Country'
const symbol = '1CTY'
const baseRentalPrice = 100
const rentalPeriod = 90
const priceMultiplier = 2

describe('OneCountryManager', function () {
  it('Should be deployed', async function () {
    const OneCountryManager = await ethers.getContractFactory(
      'OneCountryManager'
    )
    const oneCountryManager = await OneCountryManager.deploy(token, symbol, baseRentalPrice, rentalPeriod, priceMultiplier)
    await oneCountryManager.deployed()
    console.log(`oneCountryManager.address: ${oneCountryManager.address}`)
  })
})
