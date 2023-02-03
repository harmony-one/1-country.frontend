import styled from 'styled-components'

export const WalletStatusCircle = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => props.connected ? 'green' : 'red'};
`
export const WalletStatusLabel = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
`
export const WalletStatusContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
`
