import React, { useRef } from 'react'
import { Box } from 'grommet/components/Box'
import { TextInput, TextInputProps } from 'grommet/components/TextInput'

import { FormClose } from 'grommet-icons/icons/FormClose'
import styled, { css } from 'styled-components'
import { palette } from '../../constants'

const TextInputWrapper = styled(TextInput)<{ isValid?: boolean }>`
  border-radius: 20px;
  box-shadow: none;
  font-weight: 400;
  border: 1px solid #dfe1e5;
  color: #333437;
  transition: border-color 250ms, box-shadow 250ms;

  &:focus,
  &:hover {
    background-color: #fff;
    box-shadow: 0 1px 5px rgb(32 33 36 / 26%);
    border-color: rgba(223, 225, 229, 0);
  }

  ${(props) =>
    !props.isValid &&
    css`
      border-color: ${palette.PinkRed};

      &:hover,
      &:focus {
        border-color: ${palette.LightRed};
        box-shadow: 0 1px 6px rgb(255 77 79 / 26%);
      }
    `}
`

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
      <TextInputWrapper {...inputProps} />
      {allowClear && !props.disabled && props.value && (
        <InputSuffix>
          <FormClose onClick={clearValue} />
        </InputSuffix>
      )}
    </Container>
  )
}
