import React from 'react'
import styled from 'styled-components'

export const StyledInput = styled.input`
  border: none;
  font-family: 'NunitoRegular', system-ui;
  font-size: 1rem;
  box-sizing: border-box;
  padding: 0.4em;
  width: 100%;

  &:focus {
    outline: none;
  }

  &::placeholder {
    font-size: 0.7em;
    text-align: left;
  }

  @media (min-width: 640px) {
    &::placeholder {
      font-size: 1em;
    }
  }
`
