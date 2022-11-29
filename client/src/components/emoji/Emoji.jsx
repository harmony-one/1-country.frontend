import React from 'react'
import { MdEmail } from 'react-icons/md'
import { BsTelegram, BsTelephoneFill } from 'react-icons/bs'
import { Label } from '../Text'
import { EmojiButton, EmojisContainerRow } from './Emoji.styles'
import { FlexRow } from '../Layout'

export const EmojiContainer = () => {
  return (
    <EmojisContainerRow>
      <EmojiCounter icon={<BsTelephoneFill />} counter={100} />
      <EmojiCounter icon={<MdEmail />} counter={8} />
      <EmojiCounter icon={<BsTelegram />} counter={6} />
    </EmojisContainerRow>
  )
}

export const EmojiCounter = ({ icon, counter }) => {
  return (
    <FlexRow style={{ width: '3.5em' }}>
      <div style={{ fontSize: '1.2rem' }}>{icon}</div><Label>{counter}</Label>
    </FlexRow>
  )
}

export const EmojiLabel = ({ icon, counter, clickEvent }) => {
  return (
    <EmojiButton className='emoji' onClick={clickEvent}>
      <Label><span style={{ paddingRight: '0.5em' }}>{icon}</span>{counter}</Label>
    </EmojiButton>
  )
}
