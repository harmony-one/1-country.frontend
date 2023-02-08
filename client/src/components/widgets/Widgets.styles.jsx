import styled from 'styled-components'

export const DeleteWidgetButton = styled.button`
  cursor: pointer;
  position: absolute;
  top: 0;
  right: 0;
  margin-right: 8px;
  /* left: 0; */
  /* margin-left: 0.3em; */
  margin-top: 8px;
  font-size: 3em;
  opacity: 0;
  color: #758796;
  z-index: 99;
  background-color: transparent;
  border: 0;
  padding: 0;
`
export const WidgetsContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 500px;
  width: 100%;
  gap: 1em;
  position: relative;

  &:hover ${DeleteWidgetButton} {
    opacity: ${(props) => (props.isWidgetLoading ? 0 : 0.5)};
  }
`
