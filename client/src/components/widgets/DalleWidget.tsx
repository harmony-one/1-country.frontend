import React, { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'

import { WidgetControls, WidgetsContainer } from './Widgets.styles'
import { GetFileResult, telegramApi } from '../../api/telegram/telegramApi'
import { Inscription } from '../../routes/home/components/IndexedDomainPage'

interface Props {
  inscription: Inscription
}

interface ImagePayload {
  type: string
  prompt: string
  imageId: string
}

const DalleWidget: React.FC<Props> = ({ inscription }) => {
  const [imgUrl, setImgUrl] = useState('')
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(true)
  const { ref, inView } = useInView({
    /* Optional options */
    rootMargin: '0px',
    root: null,
    threshold: 0.1,
  })

  useEffect(() => {
    setLoading(true)
    const payload = inscription.payload as ImagePayload
    setPrompt(
      payload.prompt ?? 'Unable to retrieve the prompt from the inscription'
    )
    const getImgUrl = async () => {
      if (payload.imageId) {
        const data: GetFileResult = await telegramApi.getImageInfo(
          payload.imageId
        )
        if (data) {
          setImgUrl(telegramApi.getImgUrl(data.file_path))
        }
      } else {
        setImgUrl(null)
      }
      setLoading(false)
    }
    getImgUrl()
  }, [])

  return (
    <WidgetsContainer isWidgetLoading={loading} ref={ref}>
      <div style={{ paddingBottom: '2em' }}>
        {imgUrl && <img src={imgUrl} alt={'Image inscription'} />}
        <p>{prompt}</p>
      </div>
    </WidgetsContainer>
  )
}

export default DalleWidget