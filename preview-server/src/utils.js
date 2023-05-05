const ethers = require('ethers')
const moment = require('moment')
const puppeteer = require('puppeteer')
const NodeCache = require('node-cache')
const { toBech32 } = require('./bech32')
const { dcContractAddress, tweetContractAddress } = require('./config')
const dcAbi = require('./abi/dcAbi.json')
const tweetAbi = require('./abi/tweetAbi.json')

const provider = new ethers.JsonRpcProvider('https://api.harmony.one')
const metadataCache = new NodeCache({ stdTTL: 60 * 60 * 24, checkperiod: 600 })

const dcContract = new ethers.Contract(dcContractAddress, dcAbi, provider)
const tweetContract = new ethers.Contract(tweetContractAddress, tweetAbi, provider)

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

  console.log(`Owner address: ${ownerAddress} (${ownerAddressOne})`)

  const startTime = moment((parseInt(expirationTime) - parseInt(rentTime)) * 1000).format('DD/MM/YYYY')

  const domainUrls = await tweetContract.getAllUrls(domainName)
  const type = 'website'
  let url = domainUrls[domainUrls.length - 1] || ''
  let imageUrl = ''

  if (url) {
    if (url.includes('url:')) {
      url = url.replace('url:', '')
    }
  }

  console.log('url: ', url)

  if (url) {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] })
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
    type,
    ownerAddress: ownerAddressOne,
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
