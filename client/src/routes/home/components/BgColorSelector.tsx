import React, { ChangeEvent, useEffect, useState } from 'react'
import { Select } from 'grommet/components/Select'
import { useStores } from '../../../stores'
import { observer } from 'mobx-react-lite'
import { palette } from '../../../constants'

// peach, light blue, light purple
const colorOptions = [
  {
    label: 'White',
    value: palette.White,
  },
  {
    label: 'Purple',
    value: '#ce93d8',
  },
  {
    label: 'Light Red',
    value: '#f8c1b0',
  },
  {
    label: 'Light Blue',
    value: '#81d4fa',
  },
  {
    label: 'Light Green',
    value: '#c5e1a5',
  },
]

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

    const onChange = (event: ChangeEvent<HTMLSelectElement>) => {
      setColor(event.target.value)
      domainStore.updateDomain({
        domainName: domainStore.domainName,
        bgColor: event.target.value,
      })
    }

    return (
      <div>
        <Select
          name="bgColor"
          value={color}
          disabled={loadersStore.isProgress('UPDATE_DOMAIN')}
          options={colorOptions}
          labelKey="label"
          valueKey={{ key: 'value', reduce: true }}
          onChange={onChange}
        />
      </div>
    )
  }
)

BgColorSelector.displayName = 'BgColorSelector'
