import React from 'react';
import {FormField, TextInput, Form as GForm, Button} from "grommet";
import {observer} from "mobx-react-lite";
import {Form, Field} from 'react-final-form'
import {ModalContent} from "./ModalContent";
import {useStores} from "../../stores";


interface Props {
  onClose?: () => void
}

interface FormData {
  bio: string;
  telegram: string
  youtube: string
}

export const ModalProfileEditBio: React.FC<Props> = observer(({onClose}) => {

  const {domainRecordStore} = useStores();

  const handleSubmit = (values: FormData) => {
    domainRecordStore.updateProfile(values);
    onClose();
  }

  return <ModalContent>
    <Form initialValues={domainRecordStore.profile} onSubmit={handleSubmit} render={({handleSubmit}) => (
      <GForm onSubmit={handleSubmit}>
        <Field name="bio">
          {props => (
            <FormField name={props.input.name} label="BIO">
              <TextInput
                name={props.input.name}
                value={props.input.value}
                onChange={props.input.onChange}
              />
            </FormField>
          )}
        </Field>
        <Field name="telegram">
          {props => (
            <FormField name={props.input.name} label="Telegram">
              <TextInput
                name={props.input.name}
                value={props.input.value}
                onChange={props.input.onChange}
              />
            </FormField>
          )}
        </Field>
        <Field name="youtube">
          {props => (
            <FormField name={props.input.name} label="Youtube">
              <TextInput
                name={props.input.name}
                value={props.input.value}
                onChange={props.input.onChange}
              />
            </FormField>
          )}
        </Field>
        <Button type="submit" label="Confirm" />
      </GForm>
    )} />
  </ModalContent>;
});

