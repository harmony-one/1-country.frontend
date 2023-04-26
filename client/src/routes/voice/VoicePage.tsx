import React, { useRef, useState } from 'react'
import { Container } from '../home/Home.styles'
import { Box } from 'grommet/components/Box'
import { getWaveBlob } from 'webm-to-wav-converter'
import axios from 'axios'
import { observable } from 'mobx'
import { observer } from 'mobx-react-lite'
import { RecordStatus, Translation } from './types'
import { TranslationItem } from './components/TranslationItem'
import { RecordButton } from './components/RecordButton'
import config from '../../../config'
import AudioRecorder from 'audio-recorder-polyfill'
window.MediaRecorder = AudioRecorder

const translationList = observable<Translation>([])

export const VoicePage: React.FC = observer(() => {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder>(null)
  const recordedChunks = useRef<Blob[]>([])
  const [status, setStatus] = useState<RecordStatus>('stopped')

  const handleStartRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    })

    const recorder = new window.MediaRecorder(stream, {})

    recorder.addEventListener('dataavailable', (event) => {
      if (event.data.size > 0) {
        recordedChunks.current.push(event.data)
      }
    })

    recorder.addEventListener('stop', () => {
      const blob = new Blob(recordedChunks.current, {
        type: recorder.mimeType,
      })

      stream.getTracks().forEach(function (track) {
        if (track.readyState == 'live') {
          track.stop()
        }
      })

      console.log('### recorder', recorder.mimeType)
      const url = URL.createObjectURL(blob)

      const dateTime = Date.now()

      const translation: Translation = {
        translation: '',
        audio: url,
        date: dateTime,
        inProgress: true,
      }

      translationList.unshift(translation)

      const formData = new FormData()

      const wrapper = (blob: Blob) => {
        if (recorder.mimeType.includes('audio/webm')) {
          console.log('### to wav')

          return getWaveBlob(blob, false)
        }

        return Promise.resolve(blob)
      }

      wrapper(blob)
        .then((blob) => {
          formData.append('audio', blob, 'voice_record' + translation.date)

          console.log('### blob', blob)

          return axios.post<{ result: string }>(
            config.backendHost + '/translations',
            formData
          )
        })
        .then((t) => {
          const item = translationList.find((item) => {
            return item.date === dateTime
          })

          item.translation = t.data.result
          item.inProgress = false

          console.log('### translationList', translationList)
        })

      recordedChunks.current = []
    })
    recorder.start()
    setMediaRecorder(recorder)
    setStatus('recording')
  }

  const handleStopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop()
      setStatus('stopped')
    }
  }

  return (
    <Container>
      <Box pad="20px" align="center">
        <div style={{ position: 'fixed', bottom: '50px', zIndex: 100 }}>
          <RecordButton
            status={status}
            onClick={
              status === 'recording'
                ? handleStopRecording
                : handleStartRecording
            }
          />
        </div>
        <Box justify="center" gap="8px">
          {translationList.map((item) => {
            return <TranslationItem key={item.date} item={item} />
          })}
        </Box>
      </Box>
    </Container>
  )
})
