import styled from 'styled-components'

export const DeleteWidgetButton = styled.button`
  cursor: pointer;
  position: absolute;
  top: 0;
  right: 0;
  font-size: 2em;
  opacity: 0;
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

  ${DeleteWidgetButton} {
    opacity: ${(props) => (props.isWidgetLoading ? 0 : 0.5)};
  }

  // &:hover ${DeleteWidgetButton} {
  //   opacity: ${(props) => (props.isWidgetLoading ? 0 : 0.5)};
  // }
`
