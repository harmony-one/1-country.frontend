import styled from 'styled-components'

export const AppGalleryDiv = styled.div`
  /* margin: 0 auto; */
  margin-top: 1em;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: 1fr auto auto;
  grid-row-gap: 1.5em;
  grid-column-gap: 1.5em;

  @media (orientation: landscape) {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: 1fr auto auto;
    grid-row-gap: 1.5em;
    grid-column-gap: 1.5em;
    margin-bottom: 5em;
    overflow-y: auto;
  }
`

export const AppGalleryItem = styled.div<{row?: string, column?: string}>`
  grid-row: ${props => props.row};
  grid-column: ${props => props.column};
`
