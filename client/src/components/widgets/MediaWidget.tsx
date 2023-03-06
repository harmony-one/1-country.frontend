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
    if (isUrl(value)) {
      loadData(value)
    }
    setLoading(false)
  }, [value])

  return (
    <WidgetsContainer isWidgetLoading={loading} ref={ref}>
      <div style={{ paddingBottom: '2em' }}>
        {widget && (!loading || inView) && (
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
