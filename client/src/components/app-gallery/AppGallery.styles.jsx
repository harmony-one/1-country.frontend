import styled from 'styled-components'

export const AppGalleryDiv = styled.div`
  /* margin: auto 0; */
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: 7.5em auto auto;
  grid-row-gap: 1.5em;
  grid-column-gap: 0.5em;
  margin-bottom: 5em;

  @media (orientation: landscape) {
    .video-gallery {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: 7.5em auto auto;
      grid-row-gap: 0.3em;
      grid-column-gap: 0.3em;
      margin-bottom: 5em;
      overflow-y: auto;
    }
  }
`
