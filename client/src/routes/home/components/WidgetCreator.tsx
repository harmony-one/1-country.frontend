import React from 'react'
import {Box, Button} from 'grommet'
import { AiOutlineAppstoreAdd } from 'react-icons/ai'
import {WidgetContainer} from './WidgetContainer'
import {ModalIds, ModalRegister} from '../../../modules/modals'
import {useStores} from "../../../stores";
import {ModalWidgetAdd} from "../../../components/modals/ModalWidgetAdd";

interface Props {}

export const WidgetCreator: React.FC<Props> = () => {

  const {modalStore} = useStores();

  const handleClickAddWidget = () => {
    modalStore.showModal(ModalIds.PROFILE_ADD_WIDGET)
  }

  return (
    <WidgetContainer onClick={handleClickAddWidget}>
      <Box fill background="white" align="center" justify="center" gap="8px">
        <AiOutlineAppstoreAdd size="48px" />
        <Button plain label="Add widget" />
      </Box>

      <ModalRegister layerProps={{position: 'right', full: 'vertical'}} modalId={ModalIds.PROFILE_ADD_WIDGET}>
        <ModalWidgetAdd />
      </ModalRegister>
    </WidgetContainer>
  )
}
