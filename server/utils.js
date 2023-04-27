const ethers = require('ethers')
const moment = require('moment')
const RpcProvider = new ethers.JsonRpcProvider('https://api.harmony.one')

const dcContract = new ethers.Contract(
  '0x547942748Cc8840FEc23daFdD01E6457379B446D',
  [{
    inputs: [
      {
        internalType: 'string',
        name: 'name',
        type: 'string'
      }
    ],
    name: 'ownerOf',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  }, {
    inputs: [],
    name: 'duration',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  }, {
    inputs: [
      {
        internalType: 'string',
        name: 'name',
        type: 'string'
      }
    ],
    name: 'nameExpires',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      },
    ],
    stateMutability: 'view',
    type: 'function'
  }],
  RpcProvider
)

const tweetContract = new ethers.Contract(
  '0x9af78379C99f8b92aC4fc11aAB69212b6B6F95d0',
  [{
    inputs: [
      {
        internalType: 'string',
        name: 'name',
        type: 'string'
      }
    ],
    name: 'getAllUrls',
    outputs: [
      {
        internalType: 'string[]',
        name: '',
        type: 'string[]'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  }],
  RpcProvider
)

const getDomainData = async (domainName) => {
  const [ownerAddress, rentTime, expirationTime] = await Promise.all([
    dcContract.ownerOf(domainName).catch(() => ''),
    dcContract.duration(),
    dcContract.nameExpires(domainName)
  ])
  const startTime = moment((parseInt(expirationTime) - parseInt(rentTime)) * 1000).format('DD/MM/YYYY')
  // console.log('Domain name:', domainName, 'owner: ', ownerAddress, 'rentTime', rentTime, 'expirationTime', expirationTime, 'startTime', startTime)

  const domainUrls = await tweetContract.getAllUrls(domainName)
  let latestUrl = domainUrls[domainUrls.length - 1]
  if (latestUrl) {
    if (latestUrl.includes('url:')) {
      latestUrl = latestUrl.replace('url:', '')
    }
  }

  return {
    ownerAddress,
    startTime,
    latestUrl
  }
}

module.exports = {
  getDomainData
}
