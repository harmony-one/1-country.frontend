import styled from 'styled-components'
import { palette } from '../../constants'
import { ProcessStatusTypes } from './ProcessStatus'

export const ProcessStatusContainer = styled.div<{ colorType?: any }>`
  display: flex;
  width: 100%;
  word-break: break-all;
  max-width: 550px;
  flex-direction: column;
  align-items: center;
  gap: 0.2em;
  font-size: 0.9rem;
  font-size: ${(props) =>
    props.colorType !== ProcessStatusTypes.PROGRESS && '.95rem !important'};
  color: ${(props) =>
    props.colorType === ProcessStatusTypes.ERROR
      ? palette.PinkRed
      : props.colorType === ProcessStatusTypes.SUCCESS
      ? palette.KellyGreen
      : palette.default};
`
