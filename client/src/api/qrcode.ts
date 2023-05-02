export interface QrCode {
  url: string
  size: string
}

export const getQrCode = ({ url, size = '200' }: QrCode) => {
  return `https://chart.googleapis.com/chart?chs=${size}x${size}&cht=qr&chl=${url}&choe=UTF-8`
}
