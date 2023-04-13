import { ThemeType } from 'grommet/themes'
import { css } from 'styled-components'

export default {
  EmptyAddress: '0x0000000000000000000000000000000000000000',
}

export const COOKIES = {
  JWT: '_dc_jwt',
  REFERRAL: '_dc_referral',
}

export const palette = {
  default: '#758796',
  White: `#ffffff`,
  WhiteGray: '#dfe1e5',
  Purple: '#00AEE9',
  LightPurple: '#bae6f5',
  WhiteRed: '#fff2f0',
  PaleRed: '#ffccc7',
  LightRed: '#ffa39e',
  PinkRed: '#758796', //'#ff4d4f',
  KellyGreen: '#758796', //'#52c41a',
}

export const theme: ThemeType = {
  global: {
    palette,
    colors: {
      brand: palette.Purple,
      border: palette.WhiteGray,
    },
    control: {
      border: {
        radius: '12px',
      },
    },
    drop: {
      border: {
        radius: '12px',
      },
    },
  },
  textInput: {
    extend: css`
      background: ${palette.White};
    `,
  },
  select: {
    background: palette.White,
  },
  button: {
    extend: css`
      overflow: hidden;
    `,
  },
  menu: {},
}
