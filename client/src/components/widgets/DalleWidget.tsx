import React, { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { Skeleton } from 'grommet/components/Skeleton'
import {
  DalleContainer,
  WidgetControls,
  WidgetsContainer,
} from './Widgets.styles'
import {
  ImagePayload,
  Inscription,
} from '../../routes/home/components/IndexedDomainPage'

interface Props {
  payload: ImagePayload
}

const DalleWidget: React.FC<Props> = ({ payload }) => {
  const [imgUrl, setImgUrl] = useState(null)
  const [prompt, setPrompt] = useState('')
  const [showErrorMessage, setShowErrorMessage] = useState(false)
  const [loading, setLoading] = useState(false)
  const { ref, inView } = useInView({
    /* Optional options */
    rootMargin: '0px',
    root: null,
    threshold: 0.1,
  })

  useEffect(() => {
    setLoading(true)
    setPrompt(
      payload.prompt ?? 'Unable to retrieve the prompt from the inscription'
    )
    setImgUrl(payload.image ?? null)
  }, [])

  return (
    <WidgetsContainer isWidgetLoading={loading} ref={ref}>
      <DalleContainer>
        {showErrorMessage ? (
          <p>Can't process inscription data</p>
        ) : (
          <>
            <div className="img-container">
              {!imgUrl && (
                <Skeleton round="10px" width={'100%'} height={'550px'} />
              )}
              {imgUrl && (
                <img
                  src={`data:image/jpeg;base64,${imgUrl}`}
                  alt={prompt}
                  loading="lazy"
                />
              )}
            </div>
            <p>{prompt}</p>
          </>
        )}
      </DalleContainer>
    </WidgetsContainer>
  )
}

export default DalleWidget
