import * as dotenv from 'dotenv'

import { HardhatUserConfig, task } from 'hardhat/config'
import '@nomiclabs/hardhat-etherscan'
import '@nomiclabs/hardhat-waffle'
import '@typechain/hardhat'
import 'hardhat-gas-reporter'
import 'hardhat-deploy'
import 'solidity-coverage'
import 'hardhat-abi-exporter'
import '@atixlabs/hardhat-time-n-mine'
import 'hardhat-spdx-license-identifier'
import '@openzeppelin/hardhat-upgrades'
import 'hardhat-contract-sizer'
dotenv.config()

task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners()
  for (const account of accounts) {
    console.log(account.address)
  }
})

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.17',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  namedAccounts: {
    deployer: 0
  },
  networks: {
    local: {
      url: process.env.LOCAL_URL || 'http://localhost:8545',
      accounts: { mnemonic: process.env.LOCAL_MNEMONIC },
      live: false,
      saveDeployments: false
    },
    testnet: {
      url: process.env.TESTNET_URL,
      accounts: { mnemonic: process.env.TEST_MNEMONIC },
      chainId: 1666700000,
      live: true,
      gasMultiplier: 2,
      saveDeployments: true
    },
    mainnet: {
      url: process.env.MAINNET_URL,
      accounts: { mnemonic: process.env.MNEMONIC },
      chainId: 1666600000,
      live: true,
      gasPrice: 100e+9,
      gasMultiplier: 2,
      gas: 10e+6
    },
    s1: {
      url: process.env.S1_URL,
      accounts: { mnemonic: process.env.MNEMONIC },
      chainId: 1666600001,
      live: true,
      gasPrice: 100e+9,
      gasMultiplier: 2,
      gas: 10e+6
    }
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: 'USD'
  },
  abiExporter: {
    path: './abi',
    runOnCompile: true,
    clear: true,
    flat: true,
    spacing: 2,
    pretty: true,
    only: ['D1DC']
  },
  spdxLicenseIdentifier: {
    overwrite: true,
    runOnCompile: true
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true
  }
}

export default config
