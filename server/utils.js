const ethers = require('ethers')
const moment = require('moment')
const puppeteer = require('puppeteer')
const NodeCache = require('node-cache')
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

let browser
puppeteer.launch({ headless: 'new' }).then((data) => {
  console.log('Puppeteer started')
  browser = data
})

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
  const startTime = moment((parseInt(expirationTime) - parseInt(rentTime)) * 1000).format('DD/MM/YYYY')
  // console.log('Domain name:', domainName, 'owner: ', ownerAddress, 'rentTime', rentTime, 'expirationTime', expirationTime, 'startTime', startTime)

  const domainUrls = await tweetContract.getAllUrls(domainName)
  let url = domainUrls[domainUrls.length - 1]
  let imageUrl = 'https://storage.googleapis.com/dot-country-prod/countryLogo.png' // default image

  if (url) {
    if (url.includes('url:')) {
      url = url.replace('url:', '')
    }
  }

  if (url) {
    // const browser = await puppeteer.launch({ headless: 'new' })
    const page = await browser.newPage()
    await page.goto(url)
    const ogImageSelector = 'meta[property="og:image"]'
    await page.waitForSelector(ogImageSelector, { timeout: 1000 })

    const metaImageEl = await page.$(ogImageSelector)
    const metaImageContent = await page.evaluate(el => el.content, metaImageEl)
    console.log('og:image content: ', metaImageContent)
    if (metaImageContent) {
      imageUrl = metaImageContent
    }
    // await browser.close()
    // console.log('close')
  }

  const result = {
    ownerAddress,
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
