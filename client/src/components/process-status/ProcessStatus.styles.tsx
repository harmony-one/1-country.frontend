import styled from 'styled-components'
import { palette } from '../../constants'
import { ProcessStatusTypes } from './ProcessStatus'

export const ProcessStatusContainer = styled.div<{ colorType?: any }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5em;
  font-size: ${(props) =>
    props.colorType !== ProcessStatusTypes.PROGRESS && '1rem !important'};
  color: ${(props) =>
    props.colorType === ProcessStatusTypes.ERROR
      ? palette.PinkRed
      : props.colorType === ProcessStatusTypes.SUCCESS
      ? palette.KellyGreen
      : ''};
`
