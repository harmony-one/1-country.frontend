import React, { useState } from 'react'

import appConfig from '../../../config'
import { useStores } from '../../stores'
import {
  ProcessStatus,
  ProcessStatusItem,
  ProcessStatusTypes,
} from '../process-status/ProcessStatus'
import Emoji, { EmojiEnumType } from './Emoji'
import { ModalIds, ModalRegister } from '../../modules/modals'
import { ModalTipPage } from '../modals/ModalTipPage'

import { FlexRow } from '../Layout'
import { EmojiSectionContainer } from './EmojiSection.styles'

const EmojiSection = () => {
  const { domainStore } = useStores()
  const { domainName } = domainStore
  const [isProcessing, setIsProcessing] = useState(false)
  const [processStatus, setProcessStatus] = useState<ProcessStatusItem>({
    type: ProcessStatusTypes.IDLE,
    render: '',
  })

  return (
    <EmojiSectionContainer>
      <FlexRow style={{ gap: '0.6em' }}>
        <Emoji
          type={EmojiEnumType.TIP}
          tip={{ isFixed: true, fixedAmount: 1 }}
          icon="☝️"
          domainStore={domainStore}
          setProcessStatus={setProcessStatus}
          setIsProcessing={setIsProcessing}
          isProcessing={isProcessing}
        />
        <Emoji
          type={EmojiEnumType.TIP}
          tip={{ isFixed: true, fixedAmount: 10 }}
          icon="🥇"
          domainStore={domainStore}
          setProcessStatus={setProcessStatus}
          setIsProcessing={setIsProcessing}
          isProcessing={isProcessing}
        />
        <Emoji
          type={EmojiEnumType.TIP}
          tip={{ isFixed: true, fixedAmount: 100 }}
          icon="💯"
          domainStore={domainStore}
          setProcessStatus={setProcessStatus}
          setIsProcessing={setIsProcessing}
          isProcessing={isProcessing}
        />
        <Emoji
          type={EmojiEnumType.EMAIL}
          icon="📧"
          domainStore={domainStore}
          setProcessStatus={setProcessStatus}
          setIsProcessing={setIsProcessing}
          isProcessing={isProcessing}
        />
      </FlexRow>
      {processStatus.type !== ProcessStatusTypes.IDLE && (
        <span style={{ height: '1em' }}>
          <ProcessStatus status={processStatus} />
        </span>
      )}
      <ModalRegister
        layerProps={{ position: 'center', full: false }}
        modalId={ModalIds.TIP_PAGE}
      >
        {(modalProps) => (
          <ModalTipPage
            domainLevel="common" //{level}
            domainName={`${domainName}${appConfig.tld}`}
            ownerAddress={domainStore.domainRecord.renter}
            {...modalProps}
          />
        )}
      </ModalRegister>
    </EmojiSectionContainer>
  )
}

export default EmojiSection
