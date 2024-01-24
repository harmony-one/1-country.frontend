require('dotenv').config()

const dcContractAddress = process.env.DC_CONTRACT_ADDRESS || '0x547942748Cc8840FEc23daFdD01E6457379B446D'
const tweetContractAddress = process.env.TWEET_CONTRACT_ADDRESS || '0x9af78379C99f8b92aC4fc11aAB69212b6B6F95d0'

if (!dcContractAddress) {
  console.log('Set env variable DC_CONTRACT_ADDRESS, exit')
  process.exit(1)
}

if (!tweetContractAddress) {
  console.log('Set env variable TWEET_CONTRACT_ADDRESS, exit')
  process.exit(1)
}

module.exports = {
  dcContractAddress,
  tweetContractAddress
}
