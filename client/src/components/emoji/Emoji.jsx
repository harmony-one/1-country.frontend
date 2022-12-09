import React, { useEffect, useState } from 'react'
import { EmojiType } from '../../api'
import { Label, Hint } from '../Text'
import { EmojiLabelDiv, EmojisContainerRow, EmojiCounterDiv, EmojisReactionRow } from './Emoji.module'
// import { MdOutlineMail } from 'react-icons/md'
// import { TbPhoneCall, TbBrandTelegram } from 'react-icons/tb'

// const emojiIcon = {
//   telegram: <TbBrandTelegram />,
//   email: <MdOutlineMail />,
//   phone: <TbPhoneCall />
// }

// export const baseEmojiListValues = [
//   {
//     name: 'telegram',
//     icon: '☝️', // emojiIcon.telegram,
//     counter: 10,
//     color: '#0088cc',
//     price: '200'
//   },
//   {
//     name: 'email',
//     icon: '🥇', // emojiIcon.email,
//     counter: 1,
//     color: '#FBBC05',
//     price: '400'
//   },
//   {
//     name: 'phone',
//     icon: emojiIcon.phone,
//     counter: 1,
//     color: 'red',
//     price: '800'
//   }
// ]

export const baseEmojiListValues = [
  {
    name: 'One token',
    icon: '☝️', // emojiIcon.telegram,
    type: EmojiType.ONE_ABOVE,
    counter: 10,
    color: '#0088cc',
    price: '1'
  },
  {
    name: 'First price',
    icon: '🥇', // emojiIcon.email,
    type: EmojiType.FIRST_PRIZE,
    counter: 1,
    color: '#FBBC05',
    price: '10'
  },
  {
    name: '100 percent',
    icon: '💯', // emojiIcon.phone,
    type: EmojiType.ONE_HUNDRED_PERCENT,
    counter: 1,
    color: 'red',
    price: '100'
  }
]

export const EmojiCounterContainer = ({ emojiList, pageName, client }) => {
  const [emojisCounter, setEmojisCounter] = useState({})
  useEffect(() => {
    const getEmojisCounter = async () => {
      const fco = await client.getEmojisCounter({ name: pageName }) //, emojiType: 1 })
      console.log('EmojiCounter', fco)
      setEmojisCounter(fco)
    }
    getEmojisCounter()
  }, [])

  const reaction = async (emojiType) => {
    const tx = await client.addEmojiReaction({ name: pageName, emojiType: emojiType })
    console.log(tx)
  }

  return (
    <>
      <EmojisContainerRow>
        {
          emojiList &&
          emojiList.map((emoji) =>
            <EmojiCounter key={emoji.name} icon={emoji.icon} counter={emojisCounter[emoji.type]} color={emoji.color} />
          )
        }
      </EmojisContainerRow>
      <EmojisReactionRow>
        {
          emojiList &&
          emojiList.map((emoji) =>
            <EmojiLabel key={emoji.name} icon={emoji.icon} color={emoji.color} price={emoji.price} emojiType={emoji.type} clickEvent={reaction} />
          )
        }
      </EmojisReactionRow>
    </>
  )
}

export const EmojiCounter = ({ icon, counter, color }) => {
  return (
    <EmojiCounterDiv style={{ width: '3.5em' }}>
      <Label>
        <span style={{ fontSize: '1.1rem', textAlign: 'center', color: color, paddingRight: '0.2em' }}>{icon}</span>
        <span style={{ color: '#7f7f7f', fontSize: '0.85rem' }}>{counter > 0 && counter}</span>
      </Label>
      {/* <div style={{ fontSize: '1.1rem', textAlign: 'center', color: color, paddingTop: '0.1em' }}>{icon}</div><span style={{ color: '#7f7f7f', fontSize: '0.85rem' }}>{counter > 0 && counter}</span> */}
    </EmojiCounterDiv>
  )
}

export const EmojiLabel = ({ icon, price, clickEvent, emojiType }) => {
  return (
    <EmojiLabelDiv onClick={() => clickEvent(emojiType)}>
      <span style={{ paddingRight: '0.5em' }}>{icon}</span>
      <Hint>React with {price} {price > 1 ? 'tokens' : 'token'}</Hint>
    </EmojiLabelDiv>
  )
}
