import React from 'react'
import {
  FormField,
  TextInput,
  Form as GForm,
  Button,
  Box,
  Select,
} from 'grommet'
import { observer } from 'mobx-react-lite'
import { Form, Field } from 'react-final-form'
import { ModalContent } from './ModalContent'
import { useStores } from '../../stores'
import { Title } from '../Text'

// peach, light blue, light purple
const colorOptions = [
  {
    label: 'Light Red',
    value: '#f8c1b0',
  },
  {
    label: 'Light blue',
    value: '#81d4fa',
  },
  {
    label: 'Purple',
    value: '#ce93d8',
  },
  {
    label: 'Light green',
    value: '#c5e1a5',
  },
]

interface Props {
  onClose?: () => void
}

interface FormData {
  bio: string
  telegram: string
  bgColor: string
}

export const ModalProfileEditBio: React.FC<Props> = observer(({ onClose }) => {
  const { domainRecordStore } = useStores()

  const handleSubmit = (values: FormData) => {
    domainRecordStore.updateProfile(values)
    onClose()
  }

  return (
    <ModalContent>
      <Form
        initialValues={domainRecordStore.profile}
        onSubmit={handleSubmit}
        render={({ handleSubmit }) => (
          <GForm onSubmit={handleSubmit}>
            <Title>Edit Profile</Title>
            <Field name="bio">
              {(props) => (
                <FormField name={props.input.name} label="BIO">
                  <TextInput
                    name={props.input.name}
                    value={props.input.value}
                    onChange={props.input.onChange}
                  />
                </FormField>
              )}
            </Field>
            <Field name="bgColor">
              {(props) => (
                <FormField name={props.input.name} label="Background Color">
                  <Select
                    name={props.input.name}
                    value={props.input.value}
                    options={colorOptions}
                    labelKey="label"
                    valueKey={{ key: 'value', reduce: true }}
                    onChange={props.input.onChange}
                  />
                </FormField>
              )}
            </Field>
            <Box gap="12px" direction="row">
              <Button primary type="submit" label="Confirm" />
              <Button secondary onClick={onClose} label="Close" />
            </Box>
          </GForm>
        )}
      />
    </ModalContent>
  )
})
