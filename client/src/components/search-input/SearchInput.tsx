import React, { useRef } from 'react'
import { Box } from 'grommet/components/Box'
import { TextInputProps } from 'grommet/components/TextInput'

import { FormClose } from 'grommet-icons/icons/FormClose'
import styled, { css } from 'styled-components'
import { TextInput } from '../TextInput'

const InputSuffix = styled(Box)`
  position: absolute;
  display: flex;
  right: 8px;
  cursor: pointer;
  background: white;
  width: 32px;
  justify-content: center;
  align-items: center;
`

const Container = styled(Box)<{ paddingLeft?: string | null }>`
  position: relative;

  input {
    ${(props) =>
      props.paddingLeft &&
      css`
        padding-left: ${props.paddingLeft};
      `}
  }
`

export interface SearchInputProps extends TextInputProps {
  isValid?: boolean
  allowClear?: boolean
  onSearch?: (value: string) => void
}
export const SearchInput = (props: SearchInputProps) => {
  const {
    isValid = true,
    autoFocus = true,
    allowClear = true,
    onChange,
    onSearch,
    ...restProps
  } = props

  const inputRef = useRef(null)

  const clearValue = () => {
    if (inputRef && inputRef.current) {
      inputRef.current.value = ''
    }
    if (onSearch) {
      onSearch('')
    }
  }

  const inputProps: TextInputProps & { ref: any; isValid?: boolean } = {
    ref: inputRef,
    isValid,
    autoFocus,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target
      if (onSearch) {
        onSearch(value)
      }
      if (props.onChange) {
        props.onChange(e)
      }
    },
    ...restProps,
  }

  return (
    <Container
      width={'100%'}
      justify={'center'}
      paddingLeft={props.icon ? null : '24px'}
    >
      <TextInput {...inputProps} />
      {allowClear && !props.disabled && props.value && (
        <InputSuffix>
          <FormClose onClick={clearValue} />
        </InputSuffix>
      )}
    </Container>
  )
}
