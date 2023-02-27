import React, { useCallback, useContext } from 'react'
import { observer } from 'mobx-react-lite'
import { Layer } from 'grommet/components/Layer'
import { ModalContext } from './ModalContext'

interface Props {}

export const ModalProvider: React.FC<Props> = observer(() => {
  const modalContext = useContext(ModalContext)

  const modal = modalContext.modalStore.getModal(
    modalContext.modalStore.activeModalId
  )

  const handleCloseModal = useCallback(() => {
    modalContext.modalStore.hideModal()
  }, [])

  if (modalContext.modalStore.activeModalId && !modal) {
    console.error(
      `### modal ${modalContext.modalStore.activeModalId} does not registered`
    )
  }

  if (!modal || !modal.render) {
    return null
  }

  const { full = false, position = 'center' } = modal.layerProps || {}

  return (
    <Layer
      onClickOutside={handleCloseModal}
      full={full}
      position={position}
      responsive={false}
    >
      {modal.render({
        onClose: handleCloseModal,
        modalId: modalContext.modalStore.activeModalId,
      })}
    </Layer>
  )
})
