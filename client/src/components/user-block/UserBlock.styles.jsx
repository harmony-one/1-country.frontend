import styled from 'styled-components'

export const UserBlockDiv = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  flex-direction: column;
  border: 0.1px solid gray;
  border-radius: 10px;
  padding-top: 2em;
  background-color: #fee7e7;

  .status-section {
    position: absolute;
    left: 0;
    top: 0;
    margin-top: 0.5em;
    margin-left: 0.5em;
    font-size: 0.7rem;
  }

  .name-section {
    display: flex;
    flex-direction: column;
    text-align: right;
    font-size: 0.7rem;
    position: absolute;
    top: 0;
    right: 0;
    margin-top: 0.5em;
    margin-right: 0.5em;
    line-height: 1rem;
  }

  .user-picture {
    margin: 0 auto;
    width: 125px;
    height: 125px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 10px;
    }
  }

  .user-profile-text {
    padding-top: 0.6em;
    text-align: center;
    font-size: 0.8rem;
  }
`
