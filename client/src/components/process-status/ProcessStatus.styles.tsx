import styled from 'styled-components'
import { statusTypes } from './ProcessStatus'

export const ProcessStatusContainer = styled.div<{colorType?: any}>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5em;
  font-size: ${(props) => props.colorType !== statusTypes.INFO && '1.3rem !important'};
  color: ${(props) => props.colorType === statusTypes.ERROR ? 'red' : props.colorType === statusTypes.SUCCESS ? 'green' : '' };
`