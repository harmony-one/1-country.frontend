import React, { ChangeEvent, ChangeEventHandler, Dispatch, SetStateAction, useState } from 'react'
import { ModalRegister } from '../../modules/modals'
import {ModalIds} from "../../modules/modals";
import { modalStore } from '../../modules/modals/ModalContext';
import { ModalTermsConditions } from '../modals/ModalTermsConditions';

type TermsCheckboxProps = {
  checked: boolean,
  onChange: Dispatch<SetStateAction<boolean>>
}
const TermsCheckbox = ({ checked, onChange } : TermsCheckboxProps) => {
  
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation()
    onChange(env => !env)
  }
  
  const openModal = (event: React.MouseEvent<HTMLSpanElement>) => {
    event.preventDefault();
    modalStore.showModal(ModalIds.PROFILE_EDIT)
  }

  return (
    <div onClick={(e) => e.stopPropagation()} style={{ marginTop: '1em'}}>
      <label htmlFor={'terms-checkbox'}>
        <input
          type="checkbox"
          onChange={handleChange}
          checked={checked}
          id={'terms-checkbox'}
        />
        I agree to the <span onClick={openModal} style={{ color: '#00AEE9', cursor: 'pointer', zIndex:'99' }}>terms of services</span>
      </label>
      <ModalRegister layerProps={{position: 'center', full: 'vertical'}} modalId={ModalIds.PROFILE_EDIT}>
        <ModalTermsConditions setChecked={onChange} />
      </ModalRegister>
    </div>
  )
}

export default TermsCheckbox