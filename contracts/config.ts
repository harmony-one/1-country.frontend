import * as dotenv from 'dotenv'
const debug = (process.env.DEBUG === '1') || process.env.DEBUG === 'true'
dotenv.config()

export default {
  debug,
  baseRentalPrice: process.env.BASE_RENTAL_PRICE_ETH || '1',
  rentalPeriod: parseFloat(process.env.RENTAL_PERIOD_DAYS || '1'),
  priceMultiplier: parseInt(process.env.PRICE_MULTIPLIER || '2'),
  revenueAccount: process.env.REVENUE_ACCOUNT
}
