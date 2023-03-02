/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { IoMdCloseCircle } from 'react-icons/io'
import isUrl from 'is-url'

import { DeleteWidgetButton, WidgetsContainer } from './Widgets.styles'
import { parseTweetId } from '../../utils/parseTweetId'
import { getEmbedJson } from '../../api/embedly'
import { IconClose } from '../icons/Close'

export const WIDGET_TYPE = {
  feed: 0,
  post: 1,
}

// export const checkTweet = (value) => {
//   try {
//     if (isUrl(value)) {
//       const result = parseTweetId(value)
//       return result.tweetId
//         ? {
//             value: result.tweetId,
//             type: WIDGET_TYPE.post,
//             error: null,
//           }
//         : {
//             value: null,
//             error: result.error,
//           }
//     } else {
//       return {
//         value: value,
//         type: WIDGET_TYPE.feed,
//       }
//     }
//   } catch (e) {
//     console.log(e)
//     return {
//       value: null,
//       error: e,
//     }
//   }
// }

interface Props {
  value: string
  isOwner?: boolean
  onDelete: () => void
}

const MediaWidget: React.FC<Props> = ({ value, isOwner, onDelete }) => {
  const [widget, setWidget] = useState<any>()
  const [loading, setLoading] = useState(true)
  const { ref, inView } = useInView({
    /* Optional options */
    rootMargin: '0px',
    root: null,
    threshold: 0.1,
  })

  useEffect(() => {
    setLoading(true)
    console.log('### value', value)
    const getWidgetEmbed = async () => {
      const result = await getEmbedJson(value)
      if (result) {
        setWidget(result)
        setLoading(false)
      }
    }
    if (isUrl(value)) {
      getWidgetEmbed()
    }
  }, [value])
  // ref={ref}
  return (
    <WidgetsContainer isWidgetLoading={loading}>
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
          <IconClose />
        </DeleteWidgetButton>
      )}
    </WidgetsContainer>
  )
}

export default MediaWidget
