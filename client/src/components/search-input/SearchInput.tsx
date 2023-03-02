import React, {ReactNode, useRef, useState} from 'react'
import {Box, TextInput, TextInputProps} from "grommet";
import { FormClose } from 'grommet-icons';
import styled from "styled-components";

const TextInputWrapper = styled(TextInput)`
  border-radius: 20px;
  box-shadow: none;
  font-weight: 400;
  border: 1px solid #dfe1e5;
  color: #333437;

  &:focus {
    background-color: #fff;
    box-shadow: 0 1px 5px rgb(32 33 36 / 26%);
    border-color: rgba(223,225,229,0);
  }

  &:hover {
    background-color: #fff;
    box-shadow: 0 1px 6px rgb(32 33 36 / 28%);
    border-color: rgba(223,225,229,0);
  }
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

const Container = styled(Box)`
  position: relative;
`

export interface SearchInputProps extends TextInputProps {
  isValid?: boolean;
  allowClear?: boolean;
  onSearch?: (value: string) => void;
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
    if(inputRef && inputRef.current) {
      inputRef.current.value = ''
    }
    if(onSearch) {
      onSearch('')
    }
  }

  const inputProps = {
    ref: inputRef,
    autoFocus,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target
      if(onSearch) {
        onSearch(value)
      }
      if(props.onChange) {
        props.onChange(e)
      }
    },
    ...restProps,
  }

  return <Container width={'100%'} justify={'center'}>
    <TextInputWrapper {...inputProps} />
    {(allowClear && props.value) &&
      <InputSuffix>
        <FormClose onClick={clearValue} />
      </InputSuffix>
    }
  </Container>
}
