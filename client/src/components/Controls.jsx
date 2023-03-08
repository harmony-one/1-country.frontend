import styled from 'styled-components'
import { SmallText } from './Text'

export const Button = styled.button`
  font-family: 'NunitoRegular', system-ui;
  font-size: 1rem;
  font-weight: 200;
  border: none;

  width: ${(props) => props.$width || '128px'};
  color: white;
  background: #00aee9;
  border-radius: 5px;
  padding: 8px 16px;
  text-align: center;
  &:hover {
    color: #fff;
    background: #101042;
    cursor: pointer;
  }
  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }
`

export const CancelButton = styled(Button)`
  background: transparent;
  color: red;
  border: 1px solid red;
  &:hover {
    color: indianred;
    background: #ccc;
    cursor: pointer;
  }
  &:disabled {
    color: grey;
    cursor: not-allowed;
  }
`

export const LinkWrapper = styled.a`
  //margin-right: 12px;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  color: ${(props) =>
    props.type === 'text' ? 'var(--text-color)' : 'inherit'};
  text-decoration: ${(props) =>
    props.type === 'text' ? 'underline' : undefined};
  &:hover {
    color: red;
  }
  ${(props) =>
    props.$disabled
      ? `
    color: lightgrey;
    cursor: not-allowed;
  `
      : ''}
`

export const FloatingText = styled(SmallText)`
  position: absolute;
  right: 0;
  bottom: -8px;
  margin-right: 0;
`

export const Link = styled.a`
  color: #47b8eb;
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`
