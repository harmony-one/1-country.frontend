import React, { useEffect, useRef, useState } from 'react'
import { Container } from '../home/Home.styles'
import { Box } from 'grommet/components/Box'
import { observable } from 'mobx'
import { observer } from 'mobx-react-lite'
import { RecordStatus, Translation } from './types'
import { TranslationItem } from './components/TranslationItem'
import { RecordButton } from './components/RecordButton'
import config from '../../../config'

import { io } from 'socket.io-client'

import AudioRecorder from 'audio-recorder-polyfill'
import styled from 'styled-components'
window.MediaRecorder = AudioRecorder

const translationList = observable<Translation>([])
const tList = observable<any>([])

const TranslationText = styled.span<{ temp: boolean }>`
  color: ${(props) => (props.temp ? '#c1c1c1' : '#1f1f1f')};
`

const socket = io(config.backendHost)

socket.on('ReadyToTranslation', (data) => {
  console.log('### ReadyToTranslation')
})

// [].reduce((acc, item) => {
//
//   // перезависыавем последний елемент
//   // case 1: пришел AddPartialTranscript
//   // case 2: пришел AddTranscript
//   if(acc[acc.length - 1].start_time === item.start_time) {
//     acc.push(item)
//   }
//
//   return acc;
// });

export const VoicePage: React.FC = observer(() => {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder>(null)
  const recordedChunks = useRef<Blob[]>([])
  const [status, setStatus] = useState<RecordStatus>('stopped')
  const [transcription, setTranscription] = useState('')

  useEffect(() => {
    socket.on('AddTranscript', (data) => {
      console.log('### AddTranscript data', data)
      tList.push(data)
    })

    socket.on('AddPartialTranscript', (data) => {
      console.log('### AddPartialTranscript data', data)
      tList.push(data)
    })
  }, [])

  useEffect(() => {
    return () => {
      socket.disconnect()
    }
  }, [])

  const handleStartRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    })

    socket.emit('StartRecognition')

    const recorder = new window.MediaRecorder(stream, {})

    recorder.addEventListener('dataavailable', (event) => {
      socket.emit('AddAudio', event.data)
      if (event.data.size > 0) {
        recordedChunks.current.push(event.data)
      }
    })

    recorder.addEventListener('stop', () => {
      // const blob = new Blob(recordedChunks.current, {
      //   type: recorder.mimeType,
      // })
      //

      socket.emit('EndOfStream')
      stream.getTracks().forEach(function (track) {
        if (track.readyState == 'live') {
          track.stop()
        }
      })
      //
      // console.log('### recorder', recorder.mimeType)
      // const url = URL.createObjectURL(blob)
      //
      // // const a = document.createElement('a')
      // // document.body.appendChild(a)
      // // a.href = url
      // // a.download = `test${Date.now()}.wav`
      // // a.click()
      // //
      // // return
      //
      // const dateTime = Date.now()
      //
      // const translation: Translation = {
      //   translation: '',
      //   audio: url,
      //   date: dateTime,
      //   inProgress: true,
      // }
      //
      // translationList.unshift(translation)
      //
      // const formData = new FormData()
      //
      // const wrapper = (blob: Blob) => {
      //   if (recorder.mimeType.includes('audio/webm')) {
      //     console.log('### to wav')
      //
      //     return getWaveBlob(blob, false)
      //   }
      //
      //   return Promise.resolve(blob)
      // }
      //
      // wrapper(blob)
      //   .then((blob) => {
      //     formData.append('audio', blob, 'voice_record' + translation.date)
      //
      //     console.log('### blob', blob)
      //
      //     return axios.post<{ result: string }>(
      //       config.backendHost + '/translations',
      //       formData
      //     )
      //   })
      //   .then((t) => {
      //     const item = translationList.find((item) => {
      //       return item.date === dateTime
      //     })
      //
      //     item.translation = t.data.result
      //     item.inProgress = false
      //
      //     console.log('### translationList', translationList)
      //   })
      //
      // recordedChunks.current = []
    })

    recorder.start(2000)
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
          <div>{transcription}</div>

          <div>{tList.length}</div>
          <div>
            {tList
              .reduce((acc, item) => {
                if (acc.length === 0) {
                  acc.push(item)
                  console.log('### first')
                  return acc
                }
                // перезависыавем последний елемент
                // case 1: пришел AddPartialTranscript
                // case 2: пришел AddTranscript
                if (
                  acc[acc.length - 1].metadata.start_time ===
                  item.metadata.start_time
                ) {
                  console.log('### push next')

                  acc[acc.length - 1] = item

                  return acc
                }

                acc.push(item)

                return acc
              }, [])
              .map((item: any, index: number) => {
                console.log('### item', item)
                const key = `${index}${item.metadata.start_time}${item.metadata.end_time}`
                const temp = item.message === 'AddPartialTranscript'

                return (
                  <TranslationText key={key} temp={temp}>
                    {item.metadata.transcript}
                  </TranslationText>
                )
              })}
          </div>
        </Box>
      </Box>
    </Container>
  )
})
