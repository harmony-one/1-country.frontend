import styled from 'styled-components'

export const AppGalleryDiv = styled.div`
  /* margin: 0 auto; */
  margin-top: 1em;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: 8.5em auto auto;
  grid-row-gap: 1em;
  grid-column-gap: 1.5em;

  @media (orientation: landscape) {
    .video-gallery {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: 8.5em auto auto;
      grid-row-gap: 0.3em;
      grid-column-gap: 0.3em;
      margin-bottom: 5em;
      overflow-y: auto;
    }
  }
`
