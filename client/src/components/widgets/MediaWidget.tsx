import React, { lazy, useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import isUrl from 'is-url'

import {WidgetControls, WidgetsContainer} from './Widgets.styles'
import { loadEmbedJson } from '../../modules/embedly/embedly'
import { CloseCircle } from '../icons/CloseCircle'
import {Box} from "grommet/components/Box";
import {Text} from "grommet/components/Text";
import {Pin} from "../icons/Pin";
import { FiLink } from 'react-icons/fi';
import config from "../../../config";
import {Anchor} from "grommet";
import {useLocation} from "react-router";
import {toast} from "react-toastify";
import {getLevenshteinDistance} from "../../utils/string";

const StakingWidget = lazy(
  () => import(/* webpackChunkName: "StakingWidget" */ './StakingWidget')
)

interface Props {
  domainName: string
  value: string
  uuid: string
  isPinned: boolean
  isOwner?: boolean
  onDelete: () => void
}

export const MediaWidget: React.FC<Props> = ({ domainName, value, uuid, isOwner, isPinned, onDelete }) => {
  const [widget, setWidget] = useState<any>()
  const [isLoading, setLoading] = useState(true)
  const [stakingValidator, setStakingValidator] = useState<string>('')
  const { hash: locationHash } = useLocation()

  const { ref, inView } = useInView({
    /* Optional options */
    rootMargin: '0px',
    root: null,
    triggerOnce: true,
    threshold: 0.1,
  })

  useEffect(() => {
    const scrollToAnchor = (hash: string) => {
      try {
        let element = document.querySelector(hash)
        if(!element) {
          const elements = document.querySelectorAll('a[id]')
          let minDistance = Infinity
          let minDistanceElement = null
          const hashValue = hash.substring(1)

          // Iterate through all links with hashes to calculate closer link
          for(let i = 0; i < elements.length; i++) {
            const el = elements[i]
            const distance = getLevenshteinDistance(hashValue, el.id)
            console.log('Hash:', hashValue, 'link hash: ', el.id, ', distance:', distance)
            if(distance < minDistance) {
              minDistance = distance
              minDistanceElement = el
            }
          }
          console.log('Closest link: ', minDistanceElement ? minDistanceElement.id : null, ', distance ', minDistance)
          if(minDistance < 20) {
            element = minDistanceElement
          }
        }
        if(element) {
          console.log('Scroll to link with hash', element.id)
          element.scrollIntoView();
        }
      } catch(e) {}
    }

    if(!isLoading && locationHash) {
      // timeout to make sure that all widgets was loaded
      setTimeout(() => scrollToAnchor(locationHash), 350)
    }
  }, [isLoading, locationHash])

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

  const getAnchorLink = () => {
    if(widget) {
      const { title } = widget
      let route = ''
      if(title) {
        route = title.toLowerCase().replace(/[^a-z 0-9]/gi, '').split(' ').slice(0, 4).join('-')
      }
      return route
    }
    return ''
  }

  const onShareClicked = () => {
    const anchorLink = getAnchorLink()
    const link  = `https://${domainName}${config.tld}#${anchorLink}`
    navigator.clipboard.writeText(link)
    toast.success('Copied link', { type: 'default', position: 'bottom-center', hideProgressBar: true })
  }

  return (
    <Anchor id={getAnchorLink()}>
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
        <WidgetControls direction={'row'} gap={'16px'} align={'center'}>
          {/* {widget &&
            <Box onClick={onShareClicked}>
              <FiLink size={'16px'} />
            </Box>
          } */}
          {isOwner &&
            <Box onClick={onDelete} style={{ opacity: '0.5' }}>
              <CloseCircle />
            </Box>
          }
        </WidgetControls>
      </WidgetsContainer>
    </Anchor>
  )
}
