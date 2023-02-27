import React, { useContext, useEffect } from 'react'
import { ModalContext } from './ModalContext'
import { LayerProps, ModalIds, Modals } from './types'

export interface ModalRenderProps {
  onClose: () => void
  modalId: ModalIds
}

export type ModalRender = (props: ModalRenderProps) => React.ReactNode

interface Props {
  modalId: ModalIds
  params?: Modals['params']
  layerProps?: LayerProps
  children: ModalRender
}

export const ModalRegister: React.FC<Props> = React.memo(
  ({ modalId, params, layerProps, children }) => {
    const context = useContext(ModalContext)
    useEffect(() => {
      context.modalStore.addModal(modalId, {
        params,
        layerProps,
        render: children,
      })
    }, [children, context.modalStore, layerProps, modalId, params])

    useEffect(() => {
      return () => {
        context.modalStore.removeModal(modalId)
      }
    }, [context.modalStore, modalId])

    return null
  }
)
