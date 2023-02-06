import React from 'react'
import { FormField, TextInput, Form as GForm, Button, Box } from 'grommet'
import { observer } from 'mobx-react-lite'
import { Form, Field } from 'react-final-form'
import { ModalContent } from './ModalContent'
import { useStores } from '../../stores'
import { Title } from '../Text'
import {
  WidgetContentTwitter,
  WidgetItem,
  WidgetType,
} from '../../stores/WidgetsStore'

interface Props {
  onClose?: () => void
}

type FormData = WidgetContentTwitter

export const ModalWidgetTwitter: React.FC<Props> = observer(({ onClose }) => {
  const { widgetsStore } = useStores()

  const handleSubmit = (values: FormData) => {
    const widget = new WidgetItem(WidgetType.TWITTER, values)

    widgetsStore.addWidget(widget)
    onClose()
  }

  const initialValues: FormData = {
    accountName: '',
  }

  return (
    <ModalContent>
      <Form
        initialValues={initialValues}
        onSubmit={handleSubmit}
        render={({ handleSubmit }) => (
          <GForm onSubmit={handleSubmit}>
            <Title>Twitter Widget</Title>
            <Field name="accountName">
              {(props) => (
                <FormField name={props.input.name} label="Twitter account name">
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
              <Button secondary onClick={onClose} label="Close" />
            </Box>
          </GForm>
        )}
      />
    </ModalContent>
  )
})
