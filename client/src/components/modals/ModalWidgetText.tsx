import React from 'react';
import {FormField, TextInput, Select, Form as GForm, Button, Box} from "grommet";
import {observer} from "mobx-react-lite";
import {Form, Field} from 'react-final-form'
import {ModalContent} from "./ModalContent";
import {useStores} from "../../stores";
import {Title} from "../Text";
import {WidgetContentText, WidgetItem, WidgetType} from "../../stores/WidgetsStore";


interface Props {
  onClose?: () => void
}

type FormData = WidgetContentText;

const colorOptions = [
  {
    label: 'White',
    value: '#FBFBFB',
  },
  {
    label: 'Black',
    value: '#181818',
  },
  {
    label: 'Red',
    value: '#D0310E',
  },
  {
    label: 'Green',
    value: '#2CAF07',
  },
  {
    label: 'Blue',
    value: '#0053CC'
  }
];

const defaultTextColor = colorOptions[1].value;
const defaultBgColor = colorOptions[0].value;

export const ModalWidgetText: React.FC<Props> = observer(({onClose}) => {

  const {widgetsStore} = useStores();

  const handleSubmit = (values: FormData) => {
    const widget = new WidgetItem(WidgetType.TEXT, values);

    console.log('### widget', widget);
    widgetsStore.addWidget(widget);
    onClose();
  }

  const initialValues: FormData = {
    text: '',
    bgColor: defaultBgColor,
    textColor: defaultTextColor,
  };

  return <ModalContent>
    <Form initialValues={initialValues} onSubmit={handleSubmit} render={({handleSubmit}) => (
      <GForm onSubmit={handleSubmit}>
        <Title>Text Widget</Title>
        <Field name="text">
          {props => (
            <FormField name={props.input.name} label="Text">
              <TextInput
                name={props.input.name}
                value={props.input.value}
                onChange={props.input.onChange}
              />
            </FormField>
          )}
        </Field>
        <Field name="textColor">
          {props => (
            <FormField name={props.input.name} label="Text Color">
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
        <Field name="bgColor">
          {props => (
            <FormField name={props.input.name} label="Background color">
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
    )} />
  </ModalContent>;
});

