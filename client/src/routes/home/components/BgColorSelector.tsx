import React, { useEffect, useState } from 'react'
import { useStores } from '../../../stores'
import { observer } from 'mobx-react-lite'
import { palette } from '../../../constants'
import { Button } from 'grommet/components/Button'
import { Box } from 'grommet/components/Box'
import styled from 'styled-components'

// peach, light blue, light purple
const colorOptions = [
  {
    label: 'White',
    value: palette.White,
  },
  {
    label: 'Purple',
    value: '#E9E1F9',
  },
  {
    label: 'Light Red',
    value: '#F6DFDA',
  },
  {
    label: 'Light Blue',
    value: '#CFDFEF',
  },
  {
    label: 'Light Green',
    value: '#D9F4E0',
  },
]

const ColorButton = styled.div<{ bgColor: string }>`
  height: 25px;
  width: 25px;
  border: 1px solid #c2c2c2;
  border-radius: 12px;
  background-color: ${(props) => props.bgColor};
`

interface Props {
  domainName: string
  bgColor: string
}

export const BgColorSelector: React.FC<Props> = observer(
  ({ domainName, bgColor }) => {
    const [color, setColor] = useState(bgColor)

    const { domainStore, loadersStore } = useStores()

    useEffect(() => {
      document.body.style.backgroundColor = domainStore.bgColor
      setColor(domainStore.bgColor)
    }, [domainStore.bgColor])

    const switchColor = (bgColor: string) => {
      if (loadersStore.isProgress('UPDATE_DOMAIN')) {
        return
      }

      domainStore.updateDomain({
        domainName: domainStore.domainName,
        bgColor: bgColor,
      })
    }

    return (
      <div>
        <Box direction="row" gap="4px" justify="center">
          {colorOptions.map((item) => {
            return (
              <Button key={item.label} onClick={() => switchColor(item.value)}>
                <ColorButton bgColor={item.value} />
              </Button>
            )
          })}
        </Box>
      </div>
    )
  }
)
