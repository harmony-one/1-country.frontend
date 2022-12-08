import * as dotenv from 'dotenv'
const debug = (process.env.DEBUG === '1') || process.env.DEBUG === 'true'
dotenv.config()

export default {
  debug,
  baseRentalPrice: process.env.BASE_RENTAL_PRICE_ETH || '1',
  rentalPeriod: parseFloat(process.env.RENTAL_PERIOD_DAYS || '1'),
  priceMultiplier: parseInt(process.env.PRICE_MULTIPLIER || '2'),
  emailRevealPrice: process.env.EMAIL_REVEAL_PRICE_ETH || '1', // '200',
  phoneRevealPrice: process.env.PHONE_REVEAL_PRICE_ETH || '2', // '400',
  telegramRevealPrice: process.env.TELEGRAM_REVEAL_PRICE_ETH || '4', // '800',
  emojiReactionPrice0: process.env.EMOJI_REACTION_PRICE_0_ETH || '1',
  emojiReactionPrice1: process.env.EMOJI_REACTION_PRICE_1_ETH || '2', // '10',
  emojiReactionPrice2: process.env.EMOJI_REACTION_PRICE_2_ETH || '3', // '100',
  revenueAccount: process.env.REVENUE_ACCOUNT,
  initialRecordFile: process.env.INITIAL_RECORD_FILE
}
