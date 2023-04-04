export default {
  EmptyAddress: '0x0000000000000000000000000000000000000000',
}

export const COOKIES = {
  JWT: '_dc_jwt',
  REFERRAL: '_dc_referral',
}

export const palette = {
  default: '#758796',
  WhiteGray: '#dfe1e5',
  Purple: '#00AEE9',
  WhiteRed: '#fff2f0',
  PaleRed: '#ffccc7',
  LightRed: '#ffa39e',
  PinkRed: '#758796', //'#ff4d4f',
  KellyGreen: '#758796', //'#52c41a',
}

export const theme = {
  global: {
    palette,
    colors: {
      brand: palette.Purple,
      border: palette.WhiteGray,
    },
  },
}
