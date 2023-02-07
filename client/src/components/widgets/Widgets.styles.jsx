import styled from 'styled-components'

export const WidgetsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 500px;
  gap: 1em;
  position: relative;

  .widget-delete-button {
    cursor: pointer;
    position: absolute;
    left: 0;
    top: 0;
    margin-top: 0.3em;
    margin-left: 0.3em;
    font-size: 3em;
    opacity: ${props => props.hide ? 0.55 : 0};
    color: red;
    z-index: 99;
  }
`
