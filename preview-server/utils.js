const ethers = require('ethers')
const moment = require('moment')
const puppeteer = require('puppeteer')
const NodeCache = require('node-cache')
let { toBech32 } = require('./bech32')
const RpcProvider = new ethers.JsonRpcProvider('https://api.harmony.one')

const metadataCache = new NodeCache({ stdTTL: 60 * 60 * 24, checkperiod: 600 })

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
        type: 'uint256'
      },
    ],
    stateMutability: 'view',
    type: 'function'
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

// let browser
// puppeteer.launch({
//   headless: 'new',
//   args: [
//     '--no-sandbox',
//     '--disable-setuid-sandbox',
//     '--disable-gpu',
//     '--single-process'
//   ],
//   // executablePath: '/usr/bin/chromium-browser'
// }).then((data) => {
//   console.log('Puppeteer started')
//   browser = data
// })

const getDomainData = async (domainName) => {
  console.log(`Start fetching domain "${domainName}" data`)
  const cachedValue = metadataCache.get(domainName)
  if (cachedValue) {
    console.log('Found cached value', cachedValue)
    return JSON.parse(cachedValue)
  }

  const [ownerAddress, rentTime, expirationTime] = await Promise.all([
    dcContract.ownerOf(domainName).catch(() => ''),
    dcContract.duration(),
    dcContract.nameExpires(domainName)
  ])

  if (!ownerAddress) {
    throw new Error('No owner address')
  }

  const ownerAddressOne = toBech32(ownerAddress.replace('0x', '').toLowerCase(), 'one')

  console.log(`ownerAddress: ${ownerAddress} (${ownerAddressOne})`)

  const startTime = moment((parseInt(expirationTime) - parseInt(rentTime)) * 1000).format('DD/MM/YYYY')

  const domainUrls = await tweetContract.getAllUrls(domainName)
  let url = domainUrls[domainUrls.length - 1]
  let imageUrl = ''

  if (url) {
    if (url.includes('url:')) {
      url = url.replace('url:', '')
    }
  }

  console.log('url: ', url)

  if (url) {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] })
    const page = await browser.newPage()
    await page.goto(url)
    const ogImageSelector = 'meta[property="og:image"]'
    await page.waitForSelector(ogImageSelector, { timeout: 5000 })

    const metaImageEl = await page.$(ogImageSelector)
    const metaImageContent = await page.evaluate(el => el.content, metaImageEl)
    if (metaImageContent) {
      imageUrl = metaImageContent
    }
    await browser.close()
    console.log('close')
  }

  const result = {
    ownerAddress,
    ownerAddressOne,
    startTime,
    url,
    imageUrl
  }

  metadataCache.set(domainName, JSON.stringify(result))

  return result
}

module.exports = {
  getDomainData
}
