import styled from 'styled-components'
import { Box } from 'grommet/components/Box'

export const WidgetControls = styled(Box)`
  position: absolute;
  top: 0;
  right: 0;
  font-size: 2em;
  color: #758796;
  z-index: 99;
  background-color: transparent;
  border: 0;
  padding: 0;
`
export const WidgetsContainer = styled.div<{ isWidgetLoading?: boolean }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 550px;
  gap: 1em;
  position: relative;

  ${WidgetControls} {
    visibility: ${(props) => (props.isWidgetLoading ? 'hidden' : 'visible')};
  }
`
export const DalleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center !important;
  width: 100%;
  text-align: center !important;

  img {
    width: 100%;
    height: 550px;
    object-fit: cover;
    border-radius: 10px;
  }
`
