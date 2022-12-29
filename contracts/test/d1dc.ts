// import { expect } from "chai";
import { ethers } from 'hardhat'

import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signers";

const name = '.1.country'
const symbol = 'D1DC'
const baseRentalPrice = 100
const rentalPeriod = 90
const priceMultiplier = 2

describe('D1DC', function () {
  let accounts: SignerWithAddress;
  let deployer: SignerWithAddress;
  let revenueAccount: SignerWithAddress;

  this.beforeEach(async () => {
    accounts = await ethers.getSigners();
    [deployer, revenueAccount] = accounts;
  })

  it('Should be deployed', async function () {
    const D1DC = await ethers.getContractFactory('D1DC')
    const d1dc = await D1DC.deploy(name, symbol, baseRentalPrice, rentalPeriod, priceMultiplier, revenueAccount.address)
    await d1dc.deployed()
    console.log(`D1DC.address: ${d1dc.address}`)
  })
})
