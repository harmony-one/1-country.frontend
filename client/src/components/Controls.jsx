import styled from 'styled-components'
import { SmallText } from './Text'

export const Button = styled.button`
  font-family: 'NunitoRegular', system-ui;
  font-size: 1rem;
  font-weight: 200;
  border: none;
  text-decoration: none;

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
  color: #758796;
  border: 1px solid #758796;
  &:hover {
    color: white;
    background: #ccc;
    cursor: pointer;
  }
  &:disabled {
    color: white;
    border: 0;
    cursor: not-allowed;
  }
`

export const Input = styled.input`
  width: ${(props) =>
    typeof props.$width === 'number'
      ? `${props.$width || 400}px`
      : props.$width || 'auto'};
  margin-top: ${(props) => props.$marginTop || props.$margin || '32px'};
  margin-bottom: ${(props) => props.$marginBottom || props.$margin || '32px'};
  border: none;
  border-bottom: 1px solid black;
  font-size: 1rem;
  padding: 4px;
  &:hover {
    border-bottom: 1px solid black;
  }
  &:disabled {
    color: grey;
    background: lightgrey;
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

export const FloatingSwitch = styled(LinkWrapper)`
  position: absolute;
  right: 0;
  bottom: -8px;
  font-size: 12px;
  margin-right: 0;
`

export const FloatingText = styled(SmallText)`
  position: absolute;
  right: 0;
  bottom: -8px;
  margin-right: 0;
`
export const Link = styled.a`
  color: #47b8eb;
  font-size: inherit;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`
