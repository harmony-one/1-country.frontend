import styled from 'styled-components'

export const UserBlockDiv = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  border: 0.1px solid gray;
  border-radius: 10px;
  padding-top: 0.5em;

  .user-picture {
    margin: 0 auto;
    width: 4em;
    height: 4em;
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
    font-size: 0.6rem;
  }

  .social-networks {
    padding-top: 0.6em;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 1em;
    /* justify-content: space-around; */
  }
`
