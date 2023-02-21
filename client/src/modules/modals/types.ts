import React from 'react'

export enum ModalIds {
  UI_TRANSACTION = 'UI_TRANSACTION',
  PROFILE_EDIT = 'PROFILE_EDIT',
  PROFILE_ADD_WIDGET = 'PROFILE_ADD_WIDGET',
  PROFILE_ADD_WIDGET_TEXT = 'PROFILE_ADD_WIDGET_TEXT',
}

export interface LayerProps {
  full?: boolean | 'vertical' | 'horizontal'
  position?: 'center' | 'top' | 'right' | 'left' | 'bottom'
}

export type InferModalProps<T> = T extends { [key: string]: infer U }
  ? U
  : never

export type ModalMap = {
  [ModalIds.UI_TRANSACTION]: {
    params: { data: string }
    layerProps?: LayerProps
    component: React.ReactNode
  }
  [ModalIds.PROFILE_ADD_WIDGET]: {
    params: { data: string }
    layerProps?: LayerProps
    component: React.ReactNode
  }
  [ModalIds.PROFILE_ADD_WIDGET_TEXT]: {
    params: { data: string }
    layerProps?: LayerProps
    component: React.ReactNode
  }
  [ModalIds.PROFILE_EDIT]: {
    params: { data: string }
    layerProps?: LayerProps
    component: React.ReactNode
  }
}

export type Modals = InferModalProps<ModalMap>
