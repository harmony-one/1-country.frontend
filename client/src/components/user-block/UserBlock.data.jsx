import React from 'react'
import { AiFillTwitterCircle, AiFillInstagram, AiFillYoutube } from 'react-icons/ai'
import { FaTelegram, FaDiscord } from 'react-icons/fa'

export const SOCIAL_MEDIA = [
  {
    icon: <AiFillTwitterCircle size='40px' />,
    url: 'https://twitter.com/harmonyprotocol',
    name: 'twitter',
  },
  {
    icon: <AiFillInstagram size='40px' />,
    url: 'https://www.youtube.com/@Harmonyprotocol',
    name: 'instagram'
  },
  {
    icon: <AiFillYoutube size='40px' />,
    url: 'https://www.youtube.com/@Harmonyprotocol',
    name: 'youtube'
  },
  {
    icon: <FaDiscord size='40px' />,
    url: 'https://harmony.one/discord',
    name: 'discord',
  },
  {
    icon: <FaTelegram size='40px' />,
    url: 'https://harmony.one/telegram',
    name: 'telegram'
  },
]
