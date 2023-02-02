import React from 'react';

export enum ModalIds {
  PROFILE_EDIT = 'PROFILE_EDIT',
  PROFILE_ADD_WIDGET = 'PROFILE_ADD_WIDGET',
}

export interface LayerProps {
  full?: boolean | 'vertical' | 'horizontal';
  position?: 'center' | 'top' | 'right' | 'left';
}

export type InferModalProps<T> = T extends { [key: string]: infer U }
  ? U
  : never;

export type ModalMap = {
  [ModalIds.PROFILE_ADD_WIDGET]: {
    params: { data: string };
    layerProps?: LayerProps;
    component: React.ReactNode;
  };
  [ModalIds.PROFILE_EDIT]: {
    params: { data: string };
    layerProps?: LayerProps;
    component: React.ReactNode;
  };
};

export type Modals = InferModalProps<ModalMap>;
