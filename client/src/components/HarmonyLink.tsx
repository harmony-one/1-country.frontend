import React, { MouseEventHandler, useMemo } from 'react'
import { Box } from 'grommet/components/Box'
import styled from 'styled-components'
import { cutString } from '../utils/string'

interface Props {
  hash: string
  href?: string
  text?: string
  type: 'address' | 'tx' | 'block'
  cut?: boolean
  mono?: boolean
  onClick?: MouseEventHandler<HTMLAnchorElement>
}

const typeMap = {
  address: 'https://explorer.harmony.one/address/',
  tx: 'https://explorer.harmony.one/tx/',
  block: 'https://explorer.harmony.one/block/',
}

const StyledImg = styled.img`
  height: 22px;
`

const StyledLink = styled.a<{ mono: boolean }>`
  position: relative;
  top: 1px;
  text-overflow: wrap;
  word-break: break-all;
  font-family: ${(props) => (props.mono ? 'Courier' : undefined)};
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
      <StyledImg src="/tokens/one.svg" alt={type} />
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
