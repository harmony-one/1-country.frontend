import React from 'react'
import { AiFillTwitterCircle, AiFillInstagram, AiFillYoutube } from 'react-icons/ai'
import { FaTelegram, FaDiscord } from 'react-icons/fa'
import {OWNER_INFO_FIELDS} from "../../api";



export const SOCIAL_MEDIA = [
  {
    icon: <AiFillTwitterCircle size='25px' />,
    url: 'https://twitter.com/harmonyprotocol',
    name: 'twitter',
  },
  {
    icon: <AiFillInstagram size='25px' />,
    url: 'https://www.youtube.com/@Harmonyprotocol',
    name: 'instagram'
  },
  {
    icon: <AiFillYoutube size='25px' />,
    url: 'https://www.youtube.com/@Harmonyprotocol',
    name: 'youtube'
  },
  {
    icon: <FaDiscord size='25px' />,
    url: 'https://harmony.one/discord',
    name: 'discord',
  },
  {
    icon: <FaTelegram size='25px' />,
    url: 'https://harmony.one/telegram',
    name: OWNER_INFO_FIELDS.TELEGRAM
  },
] as const;


type B<T extends readonly any[]> = T[number];
export type SocialMedia = B<typeof SOCIAL_MEDIA>;
