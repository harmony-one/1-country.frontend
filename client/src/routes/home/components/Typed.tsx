import React, { useEffect, useRef } from 'react'
import Typed from 'typed.js'

interface Props {}

export const TypedText: React.FC<Props> = React.memo(() => {
  const ref = useRef()

  useEffect(() => {
    new Typed(ref.current, {
      // prettier-ignore
      strings: ['apes', 'travel', 'nft', 'food', 'crypto', 'web3', 'defi', 'soccer', 'wallet', 'bitcoin', 'music'],
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
