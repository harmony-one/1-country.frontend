import React from 'react'
import {
  FormField,
  TextInput,
  Select,
  Form as GForm,
  Button,
  Box,
} from 'grommet'
import { observer } from 'mobx-react-lite'
import { Form, Field } from 'react-final-form'
import { ModalContent } from './ModalContent'
import { useStores } from '../../stores'
import { Title } from '../Text'

interface Props {
  onClose?: () => void
}

type FormData = {
  socialType: string
  link: string
}

const socialOptions = [
  {
    label: 'Twitter',
    value: 'twitter',
  },
  {
    label: 'Youtube',
    value: 'youtube',
  },
  {
    label: 'Discord',
    value: 'discord',
  },
]

export const ModalProfileAddSocial: React.FC<Props> = observer(
  ({ onClose }) => {
    const { domainRecordStore } = useStores()
    const handleSubmit = (values: FormData) => {
      console.log('### values', values)

      const key = values.socialType
      const value = values.link

      domainRecordStore.updateProfile({ [key]: value })
      onClose()
    }

    const initialValues: FormData = {
      link: '',
      socialType: '',
    }

    return (
      <ModalContent>
        <Form
          initialValues={initialValues}
          onSubmit={handleSubmit}
          render={({ handleSubmit }) => (
            <GForm onSubmit={handleSubmit}>
              <Title>Add Social</Title>
              <Field name="socialType">
                {(props) => (
                  <FormField name={props.input.name} label="Social Network">
                    <Select
                      name={props.input.name}
                      value={props.input.value}
                      options={socialOptions}
                      labelKey="label"
                      valueKey={{ key: 'value', reduce: true }}
                      onChange={props.input.onChange}
                    />
                  </FormField>
                )}
              </Field>
              <Field name="link">
                {(props) => (
                  <FormField name={props.input.name} label="Link">
                    <TextInput
                      name={props.input.name}
                      value={props.input.value}
                      onChange={props.input.onChange}
                    />
                  </FormField>
                )}
              </Field>
              <Box gap="12px" direction="row">
                <Button primary type="submit" label="Confirm" />
                <Button secondary onClick={onClose} label="Cancel" />
              </Box>
            </GForm>
          )}
        />
      </ModalContent>
    )
  }
)
