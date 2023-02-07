import styled from 'styled-components'

export const DeleteWidgetButton = styled.button`
  cursor: pointer;
  position: absolute;
  top: 0;
  right: 0;
  margin-right: 1em;
  /* left: 0; */
  /* margin-left: 0.3em; */
  margin-top: 0.3em;
  font-size: 3em;
  opacity: 0; 
  color: #4c4c4c;
  z-index: 99;
  background-color: transparent;
  border: 0px;
`
export const WidgetsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 500px;
  gap: 1em;
  position: relative;

  &:hover ${DeleteWidgetButton} {
    opacity: ${props => (props.isWidgetLoading ? 0 : 0.5)}; 
  }
`
