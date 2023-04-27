import React, { lazy, useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import isUrl from 'is-url'

import {WidgetControls, WidgetsContainer} from './Widgets.styles'
import { loadEmbedJson } from '../../modules/embedly/embedly'
import { CloseCircle } from '../icons/CloseCircle'
import {Box} from "grommet/components/Box";
import {Text} from "grommet/components/Text";
import {Pin} from "../icons/Pin";

const StakingWidget = lazy(
  () => import(/* webpackChunkName: "StakingWidget" */ './StakingWidget')
)

interface Props {
  value: string
  uuid: string
  isPinned: boolean
  isOwner?: boolean
  onPin: (isPinned: boolean) => void
  onDelete: () => void
}

export const MediaWidget: React.FC<Props> = ({ value, uuid, isOwner, isPinned, onDelete, onPin }) => {
  const [widget, setWidget] = useState<any>()
  const [isLoading, setLoading] = useState(true)
  const [stakingValidator, setStakingValidator] = useState<string>('')

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
    } catch (ex) {
      console.log('### embedly ex', ex)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (value.indexOf('staking:') === 0) {
      if (value.indexOf('staking:') === 0) {
        const output = value.replace(
          /(?<=^staking:)(?:\s*staking:)+|(?:staking:\s*)+(?=staking:$)/gi,
          ''
        )
        setStakingValidator(output.split('staking:')[1])
        setLoading(false)
        return
      }
    }

    if (isUrl(value)) {
      loadData(value)
    }
    if (value === '1621679626610425857') {
      loadData(
        'https://twitter.com/harmonyprotocol/status/1621679626610425857?s=20&t=SabcyoqiOYxnokTn5fEacg'
      )
    }
  }, [value])

  return (
    <Box>
      {isPinned && !isLoading &&
        <Box direction={'row'} gap={'8px'} style={{ textAlign: 'left' }}>
          <Pin />
          <Text size={'small'}>Pinned {widget && widget.url && widget.url.includes('twitter') ? 'Tweet' : 'Link'}</Text>
        </Box>
      }
      <WidgetsContainer isWidgetLoading={isLoading} ref={ref}>
        <Box pad={{ bottom: '2em' }}>
          {
            stakingValidator && (<StakingWidget validator={stakingValidator} />)
          }
          {!stakingValidator && widget && (!isLoading || inView) && (
            <blockquote className="embedly-card" style={{ zIndex: '10' }}>
              <h4>
                <a href={widget.url}>{widget.title}</a>
              </h4>
              <p>{widget.description}</p>
            </blockquote>
          )}
        </Box>
        {isOwner && (
          <WidgetControls direction={'row'} gap={'16px'} align={'center'}>
            {uuid &&
              <Box onClick={() => onPin(!isPinned)}>
                <Text>{isPinned ? 'Unpin' : `Pin ${widget && widget.url.includes('twitter') ? 'Tweet' : 'Link'}`}</Text>
              </Box>
            }
            <Box onClick={onDelete} style={{ opacity: '0.5' }}>
              <CloseCircle />
            </Box>
          </WidgetControls>
        )}
      </WidgetsContainer>
    </Box>
  )
}
