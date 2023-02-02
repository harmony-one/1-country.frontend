import React, { useCallback, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { Layer } from 'grommet';
import { ModalContext } from './ModalContext';

interface Props {}

export const ModalProvider: React.FC<Props> = observer(() => {
  const modalContext = useContext(ModalContext);

  const modal = modalContext.modalStore.getModal(modalContext.modalStore.activeModalId);

  const handleCloseModal = useCallback(
    () => {
      modalContext.modalStore.hideModal()
    },
    [],
  );

  if (modalContext.modalStore.activeModalId && !modal) {
    console.error(`### modal ${modalContext.modalStore.activeModalId} does not registered`);
  }

  if (!modal || !modal.component) {
    return null;
  }

  const { full = false, position = 'center' } = modal.layerProps || {};

  const modalComponent = React.cloneElement(
    modal.component as React.ReactElement<{
      onClose: () => void;
    }>,
    { onClose: handleCloseModal },
  );

  return (
    <Layer
      onClickOutside={handleCloseModal}
      full={full}
      position={position}
      responsive={true}
    >
      {modalComponent}
    </Layer>
  );
});
