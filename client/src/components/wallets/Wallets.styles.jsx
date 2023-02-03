import styled from 'styled-components'

export const WalletStatusContainer = styled.div`
  cursor: pointer;
  line-height: 1.2em;
`
export const WalletStatusLabel = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`
export const WalletStatusCircle = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => props.connected ? 'green' : 'red'};
`

export const WalletsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
  gap: 0.5em;
`
