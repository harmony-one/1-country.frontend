import React, { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { uiTransactionStore } from './UITransactionStore'
import { modalStore } from '../modals/ModalContext'
import { ModalIds, ModalRegister } from '../modals'
import { UITransactionModal } from './UITransactionModal'

interface Props {}

export const UITransactionProvider: React.FC<Props> = observer(() => {
  useEffect(() => {
    if (uiTransactionStore.activeId) {
      modalStore.showModal(ModalIds.UI_TRANSACTION)
    }
  }, [uiTransactionStore.activeId])

  return (
    <ModalRegister modalId={ModalIds.UI_TRANSACTION}>
      <UITransactionModal />
    </ModalRegister>
  )
})
