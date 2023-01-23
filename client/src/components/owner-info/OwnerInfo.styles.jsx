import styled from 'styled-components'

export const PersonalInfoRevealContainer = styled.div`
  width: 550px;

  .reveal-button {
    cursor: pointer;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    border-bottom: 1px solid #0000001f;
    margin-bottom: 1em;
  }
  
  .icon-button {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    border: 1px solid grey;
    padding: 0.3em 1em 0.3em;
    border-radius: 25px;
  }

  button {
    cursor: pointer;
    border: 1px solid grey;
    padding: 0.3em 1em 0.3em;
    border-radius: 25px;
    background-color: inherit;
  }

`
