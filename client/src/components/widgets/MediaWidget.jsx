/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { IoMdCloseCircle } from 'react-icons/io'
import isUrl from 'is-url'

import { DeleteWidgetButton, WidgetsContainer } from './Widgets.styles'
import { parseTweetId } from '../../utils/parseTweetId'
import { getEmbedJson } from '../../api/embedly'

export const WIDGET_TYPE = {
  feed: 0,
  post: 1,
}


export const checkTweet = (value) => {
  try {
    if (isUrl(value)) {
      const result = parseTweetId(value)
      return result.tweetId
        ? {
            value: result.tweetId,
            type: WIDGET_TYPE.post,
            error: null,
          }
        : {
            value: null,
            error: result.error,
          }
    } else {
      return {
        value: value,
        type: WIDGET_TYPE.feed,
      }
    }
  } catch (e) {
    console.log(e)
    return {
      value: null,
      error: e,
    }
  }
}

const MediaWidget = ({ value, type, deleteWidget }) => {
  const [widget, setWidget] = useState()
  const [loading, setLoading] = useState(true)
  const { ref, inView } = useInView({
    /* Optional options */
    rootMargin: '0px',
    root: null,
    threshold: 0.1,
  })

  useEffect(() => {
    setLoading(true)

    const getWidgetEmbed = async () => {
      const result = await getEmbedJson(value)
      console.log('YES0dfdffdsdsd')
      if (result) {
        console.log('YES0dfdf',result)
        setWidget(result)
      }
      
    }
   
    if (isUrl(value)) {
      getWidgetEmbed()
    } 

  }, [value])

  const deleteItem = () => {
    deleteWidget(value)
  }

  return (
    <WidgetsContainer isWidgetLoading={loading} ref={ref}>
      <div style={{ paddingBottom: '2em' }}>
        {widget && (!loading || inView) && 
          (<blockquote className="embedly-card" style={{ zIndex: '10'}}>
            <h4>
              <a href={widget.url}>{widget.title}
              </a>
            </h4>
            <p>
              {widget.description}
            </p>
          </blockquote>)}
      </div>
      <DeleteWidgetButton onClick={deleteItem}>
        <IoMdCloseCircle />
      </DeleteWidgetButton>
    </WidgetsContainer>
  )
}

export default MediaWidget
