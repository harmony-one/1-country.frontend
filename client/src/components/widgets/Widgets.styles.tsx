import styled from 'styled-components'
import { Box } from 'grommet/components/Box'

export const WidgetControls = styled(Box)`
  position: absolute;
  top: 0;
  right: 0;
  font-size: 2em;
  color: #758796;
  z-index: 2;
  background-color: transparent;
  border: 0;
  padding: 0;
`

export const WidgetsContainer = styled.div<{ isWidgetLoading?: boolean }>`
  display: flex;
  flex-direction: column;
  width: 100% !important;
  max-width: 550px;
  gap: 1em;
  position: relative;
  align-items: center;

  ${WidgetControls} {
    visibility: ${(props) => (props.isWidgetLoading ? 'hidden' : 'visible')};
  }
`

export const MemeTokenContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center !important;
  width: 100%;
  justify-content: space-between;
  text-align: center !important;
`

export const DalleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center !important;
  width: 100%;
  max-width: 550px;
  text-align: center !important;

  .img-container {
    cursor: pointer;
    width: 100%;
    max-width: 550px;
    max-height: 550px;
    margin-bottom: 1em;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      border-radius: 10px;
    }
  }
`
