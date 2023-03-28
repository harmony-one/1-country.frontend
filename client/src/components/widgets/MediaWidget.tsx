import React, { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import isUrl from 'is-url'

import { DeleteWidgetButton, WidgetsContainer } from './Widgets.styles'
import { loadEmbedJson } from '../../modules/embedly/embedly'
import { CloseCircle } from '../icons/CloseCircle'

interface Props {
  value: string
  isOwner?: boolean
  onDelete: () => void
}

export const MediaWidget: React.FC<Props> = ({ value, isOwner, onDelete }) => {
  const [widget, setWidget] = useState<any>()
  const [loading, setLoading] = useState(true)
  const [stakingIframeSrc, setStakingIframeSrc] = useState<any>()

  const { ref, inView } = useInView({
    /* Optional options */
    rootMargin: '0px',
    root: null,
    triggerOnce: true,
    threshold: 0.1,
  })

  const loadData = async (url: string) => {
    setLoading(true)
    try {
      const result = await loadEmbedJson(url)
      if (result) {
        setWidget(result)
      }
      setLoading(false)
    } catch (ex) {
      console.log('### embedly ex', ex)
      setLoading(false)
    }
  }

  useEffect(() => {
    const stakingWidgetBaseUrl = 'https://staking-sdk-react-example.web.app/';

    if(value.indexOf(stakingWidgetBaseUrl) === 0) {
      setStakingIframeSrc(value);
      setLoading(false);
      return;
    }

    if (isUrl(value)) {
      loadData(value)
    }
    if (value === '1621679626610425857') {
      loadData(
        'https://twitter.com/harmonyprotocol/status/1621679626610425857?s=20&t=SabcyoqiOYxnokTn5fEacg'
      )
    }
    setLoading(false)
  }, [value])

  return (
    <WidgetsContainer isWidgetLoading={loading} ref={ref}>
      <div style={{ paddingBottom: '2em' }}>
        {
          stakingIframeSrc && (
            <iframe 
              width="600px"
              height="600px"
              style={{
                overflow: 'hidden',
                border: 0
              }}
              src={stakingIframeSrc} 
            />
          )
        }
        {!stakingIframeSrc && widget && (!loading || inView) && (
          <blockquote className="embedly-card" style={{ zIndex: '10' }}>
            <h4>
              <a href={widget.url}>{widget.title}</a>
            </h4>
            <p>{widget.description}</p>
          </blockquote>
        )}
      </div>
      {isOwner && (
        <DeleteWidgetButton onClick={onDelete}>
          <CloseCircle />
        </DeleteWidgetButton>
      )}
    </WidgetsContainer>
  )
}