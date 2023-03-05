import styled from 'styled-components'
import { ProcessStatusTypes } from './ProcessStatus'

export const ProcessStatusContainer = styled.div<{ colorType?: any }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5em;
  font-size: ${(props) =>
    props.colorType !== ProcessStatusTypes.INFO && '1.1rem !important'};
  color: ${(props) =>
    props.colorType === ProcessStatusTypes.ERROR
      ? 'red'
      : props.colorType === ProcessStatusTypes.SUCCESS
      ? 'green'
      : ''};
`
