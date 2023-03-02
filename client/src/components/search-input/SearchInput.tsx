import React, {useRef, useState} from 'react'
import {Box, TextInput, TextInputProps} from "grommet";
import { FormSearch, FormClose } from 'grommet-icons';
import styled from "styled-components";

const TextInputWrapper = styled(TextInput)`
  border-radius: 24px;
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
  right: 16px;
  cursor: pointer;
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
  const [value, setValue] = useState(props.defaultValue || '')

  const inputProps = {
    ref: inputRef,
    autoFocus,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target
      setValue(value)
      if(onSearch) {
        onSearch(value)
      }
    },
    ...restProps,
  }

  const clearValue = () => {
    if(inputRef && inputRef.current) {
      inputRef.current.value = ''
    }
    setValue('')
    if(onSearch) {
      onSearch('')
    }
  }

  return <Container width={'100%'} justify={'center'}>
    <TextInputWrapper icon={<FormSearch />} {...inputProps} />
    {(allowClear && value) &&
      <InputSuffix>
        <FormClose onClick={clearValue} />
      </InputSuffix>
    }
  </Container>
}
