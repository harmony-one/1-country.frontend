const express = require('express')
const app = express()
const fs = require('fs')
const path = require('path')
const { getDomainData } = require('./utils')
const PORT = process.env.PORT || 3000

const indexPath = path.resolve(__dirname, '..', 'client/dist', 'index.html')

app.get(['/index.html', '/'], async (req, res, next) => {
  let htmlData = fs.readFileSync(indexPath, 'utf8')
  try {
    const [domainName] = req.get('host').split('.')

    const { ownerAddress, startTime, latestUrl } = await getDomainData(domainName)

    const description = `By ${ownerAddress} since ${startTime}`
    htmlData = htmlData
      .replace('__META_OG_TITLE__', `${domainName}.country: ${latestUrl}`)
      .replace('__META_DESCRIPTION__', description)
      .replace('__META_OG_DESCRIPTION__', description)
      .replace('__META_OG_IMAGE__', '')
      .replace('__META_OG_URL__', latestUrl)

    return res.send(htmlData)
  } catch (e) {
    console.log('Error: ', e)
    return res.send(htmlData)
  }
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
