import React, { useEffect, useRef, useState } from 'react'
import { useAccount } from 'wagmi'
import { toast } from 'react-toastify'
import { getEmojiPrice } from '../../api'

import config from '../../../config'
import { Label, Hint } from '../Text'
import { EmojiLabelDiv, EmojisContainerRow, EmojiCounterDiv, EmojisReactionRow } from './Emoji.styles'
import { wagmiClient } from '../../modules/wagmi/wagmiClient'
import { useIsHarmonyNetwork } from '../../hooks/network'

const baseEmojiListValues = [
  {
    name: 'One token',
    icon: '☝️', // emojiIcon.telegram,
    type: config.emojiType.ONE_ABOVE,
    counter: 0,
    color: '#0088cc',
    price: getEmojiPrice(config.emojiType.ONE_ABOVE)
  },
  {
    name: 'First price',
    icon: '🥇', // emojiIcon.email,
    type: config.emojiType.FIRST_PRIZE,
    counter: 0,
    color: '#FBBC05',
    price: getEmojiPrice(config.emojiType.FIRST_PRIZE)
  },
  {
    name: '100 percent',
    icon: '💯', // emojiIcon.phone,
    type: config.emojiType.ONE_HUNDRED_PERCENT,
    counter: 0,
    color: 'red',
    price: getEmojiPrice(config.emojiType.ONE_HUNDRED_PERCENT)
  }
]

export const EmojiCounterContainer = ({ pageName, client }) => {
  const [emojisCounter, setEmojisCounter] = useState(baseEmojiListValues)
  const { isConnected } = useAccount()
  const toastId = useRef(null)

  useEffect(() => {
    const getEmojisCounter = async () => {
      const counters = await client.getEmojisCounter({ name: pageName })
      const newState = emojisCounter.map(emoji => {
        return { ...emoji, counter: counters[emoji.type] }
      })
      setEmojisCounter(newState)
    }
    getEmojisCounter()
  }, [])

  const isHarmonyNetwork = useIsHarmonyNetwork()

  const reaction = async (emojiType) => {
    if (!isHarmonyNetwork) {
      await wagmiClient.connector.connect({ chainId: config.chainParameters.id })
    }

    if (isConnected) {
      toastId.current = toast.loading('Processing transaction')
      const tx = await client.addEmojiReaction({ name: pageName, emojiType: emojiType })
      if (tx) {
        const counter = await client.getEmojiCounter({ name: pageName, emojiType: emojiType })
        const newState = emojisCounter.map(emoji => {
          if (emoji.type === emojiType) {
            return { ...emoji, counter: counter }
          }
          return emoji
        })
        setEmojisCounter(newState)
        toast.update(toastId.current, {
          render: 'Transaction success!',
          type: 'success',
          isLoading: false,
          autoClose: 2000
        })
      } else {
        toast.update(toastId.current, {
          render: 'Error processing the transaction',
          type: 'error',
          isLoading: false,
          autoClose: 2000
        })
      }
      console.log(tx)
    } else {
      toast.error('Please connect your wallet')
    }
  }

  return (
    <>
      <EmojisContainerRow>
        {
          emojisCounter &&
          emojisCounter.map((emoji) =>
            <EmojiCounter key={emoji.name} icon={emoji.icon} counter={emoji.counter} color={emoji.color} emojiType={emoji.type} clickEvent={reaction} />
          )
        }
      </EmojisContainerRow>
      <EmojisReactionRow>
        {
          emojisCounter &&
          emojisCounter.map((emoji) =>
            <EmojiLabel key={emoji.name} icon={emoji.icon} color={emoji.color} price={emoji.price} emojiType={emoji.type} clickEvent={reaction} />
          )
        }
      </EmojisReactionRow>
    </>
  )
}

export const EmojiCounter = ({ icon, counter, color, clickEvent, emojiType }) => {
  return (
    <EmojiCounterDiv style={{ width: '3.5em' }} onClick={() => clickEvent(emojiType)}>
      <Label>
        <span style={{ fontSize: '1.1rem', textAlign: 'center', color: color, paddingRight: '0.2em' }}>{icon}</span>
        <span style={{ color: '#7f7f7f', fontSize: '0.85rem' }}>{counter > 0 && counter}</span>
      </Label>
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
