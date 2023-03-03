import React, { useEffect, useRef } from 'react'
import Typed from 'typed.js'

interface Props {}

export const TypedText: React.FC<Props> = React.memo(() => {
  const ref = useRef()

  useEffect(() => {
    new Typed(ref.current, {
      strings: [
        'apes',
        'nft',
        'food',
        'crypto',
        'travel',
        'web3',
        'mine',
        'defi',
        'fomo',
        'wallet',
        'bitcoin',
        'dao',
        'pow',
        'hodl',
        'token',
      ],
      typeSpeed: 100,
      backSpeed: 90,
      backDelay: 500,
      startDelay: 0,
      cursorChar: '',
      // fadeOut: true,
      loop: true,
    })
  }, [ref.current])

  return <span ref={ref} />
})
