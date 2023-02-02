import React from 'react';

export enum ModalIds {
  PROFILE_EDIT_SOCIAL = 'PROFILE_EDIT_SOCIAL',
  PROFILE_EDIT_BIO = 'PROFILE_EDIT_BIO',
}

export interface LayerProps {
  full?: boolean | 'vertical' | 'horizontal';
  position?: 'center' | 'top';
}

export type InferModalProps<T> = T extends { [key: string]: infer U }
  ? U
  : never;

export type ModalMap = {
  [ModalIds.PROFILE_EDIT_BIO]: {
    params: { data: string };
    layerProps?: LayerProps;
    component: React.ReactNode;
  };
  [ModalIds.PROFILE_EDIT_SOCIAL]: {
    params: { data: string };
    layerProps?: LayerProps;
    component: React.ReactNode;
  };
};

export type Modals = InferModalProps<ModalMap>;
