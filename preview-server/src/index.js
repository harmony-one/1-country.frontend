const express = require('express')
const app = express()
const fs = require('fs')
const path = require('path')
const { getDomainData } = require('./utils')
const PORT = process.env.PORT || 3000

const templatePath = path.resolve(__dirname, 'template.html')

app.get(['/index.html', '/'], async (req, res, next) => {
  let htmlData = fs.readFileSync(templatePath, 'utf8')

  const host = req.get('host')
  const domainName = req.query.domainName || host.split('.')[0] || ''

  console.log(`New request: host "${host}", domainName: ${domainName}`)

  // Default values
  let title = '.country | Harmony'
  let description = 'Harmony\'s .country domains allow a seamless transition between Web2 and Web3. You can use your .country domain for both traditional websites and decentralized applications, making it easier to access everything you need from one place!'
  let imageUrl = 'https://storage.googleapis.com/dot-country-prod/countryLogo.png'
  let url = 'https://1.country'
  let type = 'website'

  try {
    const {
      type: ogType,
      ownerAddress,
      startTime,
      url: ogUrl,
      imageUrl: ogImageUrl
    } = await getDomainData(domainName)

    title = `${domainName}.country: ${ogUrl}`
    description = `By ${ownerAddress} since ${startTime}`
    imageUrl = ogImageUrl
    url = ogUrl
    type = ogType
  } catch (e) {
    console.error('Cannot get domain data: ', e)
  }

  console.log(`Host ${host} preview: title "${title}", description "${description}", imageUrl: ${imageUrl}, url: ${url}`)

  htmlData = htmlData
    .replaceAll('__META_OG_TYPE__', type)
    .replaceAll('__META_OG_TITLE__', title)
    .replaceAll('__META_DESCRIPTION__', description)
    .replaceAll('__META_OG_DESCRIPTION__', description)
    .replaceAll('__META_OG_IMAGE__', imageUrl)
    .replaceAll('__META_OG_URL__', url)

  return res.send(htmlData)
})

app.use(express.static(
  path.resolve(__dirname, '..', 'client/dist'),
  { maxAge: '30d' }
))

app.listen(PORT, (error) => {
  if (error) {
    return console.log('Error during app startup', error)
  }
  console.log('listening on port ' + PORT + '...')
})
