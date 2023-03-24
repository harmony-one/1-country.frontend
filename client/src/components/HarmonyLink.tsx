import React, { MouseEventHandler, useMemo } from 'react'
import { Box } from 'grommet/components/Box'
import styled from 'styled-components'
import { cutString } from '../utils/string'
import config from '../../config'

interface Props {
  hash: string
  href?: string
  text?: string
  type: 'address' | 'tx' | 'block' | 'nft'
  cut?: boolean
  mono?: boolean
  onClick?: MouseEventHandler<HTMLAnchorElement>
}

const typeMap = {
  address: config.explorer.address,
  tx: config.explorer.tx,
  block: config.explorer.block,
  nft: '',
}

const StyledImg = styled.img`
  height: 16px;
`

const StyledLink = styled.a<{ mono: boolean }>`
  position: relative;
  font-size: 0.9em;
  text-overflow: wrap;
  word-break: break-all;
  font-family: ${(props) =>
    props.mono ? 'Courier' : `'NunitoBold', system-ui`};
  color: #47b8eb;
`

export const HarmonyLink: React.FC<Props> = ({
  hash = '',
  type,
  text,
  cut = true,
  mono = false,
  href,
  onClick = () => undefined,
}) => {
  const link = typeMap[type] + hash

  const content = useMemo(() => {
    if (text) {
      return text
    }

    if (!cut) {
      return hash
    }

    return cutString(hash)
  }, [hash, text, cut])

  return (
    <Box direction="row" align="center" gap="4px">
      <StyledImg width="16px" height="16px" src="/tokens/one.svg" alt={type} />
      <StyledLink
        mono={mono}
        title={hash}
        onClick={onClick}
        target="_blank"
        rel="noreferrer"
        href={href || link}
      >
        {content}
      </StyledLink>
    </Box>
  )
}
