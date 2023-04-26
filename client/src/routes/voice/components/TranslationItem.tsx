import React from 'react'
import { Box } from 'grommet/components/Box'
import { Spinner } from 'grommet/components/Spinner'
import { BaseText, SmallText } from '../../../components/Text'
import { Translation } from '../types'
import styled from 'styled-components'
import { observer } from 'mobx-react-lite'

const StyleBox = styled(Box)`
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #758796;
`

const dateFormat = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export const TranslationItem: React.FC<{
  item: Translation
}> = observer(({ item }) => {
  return (
    <StyleBox align="center">
      <SmallText>{dateFormat.format(item.date)}</SmallText>
      {item.inProgress && <Spinner />}
      <BaseText>{item.translation}</BaseText>
      <audio src={item.audio} controls />
    </StyleBox>
  )
})
