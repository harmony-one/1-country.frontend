import React, { HTMLInputTypeAttribute } from 'react'
import createNumberMask from 'text-mask-addons/dist/createNumberMask'
import {
  CurrencyInputContainer,
  CurrencyMasketInput,
} from './CurrencyInput.styles'

const defaultMaskOptions = {
  prefix: '',
  suffix: ' ONE',
  includeThousandsSeparator: true,
  thousandsSeparatorSymbol: '',
  allowDecimal: false,
  decimalSymbol: '.',
  decimalLimit: 0, // how many digits allowed after the decimal
  integerLimit: 32, // limit length of integer numbers
  allowNegative: false,
  allowLeadingZeroes: false,
}

export type MaskOptionsType = {
  prefix: string
  suffix: string
  includeThousandsSeparator: boolean
  thousandsSeparatorSymbol: string
  allowDecimal: boolean
  decimalSymbol: string
  decimalLimit: number
  integerLimit: number
  allowNegative: boolean
  allowLeadingZeroes: boolean
}

type CurrencyInputProps = {
  maskOptions?: MaskOptionsType
}

const CurrencyInput = ({
  maskOptions,
  ...inputProps
}: CurrencyInputProps & any) => {
  const currencyMask = createNumberMask({
    ...defaultMaskOptions,
    ...maskOptions,
  })

  return (
    <CurrencyInputContainer>
      <CurrencyMasketInput mask={currencyMask} {...inputProps} />
    </CurrencyInputContainer>
  )
}

export default CurrencyInput
