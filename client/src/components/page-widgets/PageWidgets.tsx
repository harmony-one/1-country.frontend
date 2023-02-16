import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import TwitterWidget, { checkTweet } from '../widgets/TwitterWidget'
import {
  PageWidgetContainer,
  WidgetInputContainer,
  WidgetStyledInput,
} from './PageWidgets.styles'
import { openWidgetsPageStore } from '../../routes/open-widgets/OpenWidgetsPageStore'
import { TransactionWidget } from '../widgets/TransactionWidget'
import { useStores } from '../../stores'
import { DomainRecord } from '../../api'
import { observer } from 'mobx-react-lite'
import MediaWidget from '../widgets/MediaWidget'

const defaultFormFields = {
  widgetValue: '',
}

type PageWidgetsProps = {
  name?: string,
  isOwner: boolean
  showAddButton: boolean
}

const PageWidgets = observer(({ name, isOwner, showAddButton }: PageWidgetsProps) => {
  const [widgetList, setWidgetList] = useState([])
  const [isValid, setIsValid] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [addingWidget, setAddingWidget] = useState(false)
  const [formFields, setFormFields] = useState(defaultFormFields)
  const [placeHolder, setPlaceHolder] = useState('')
  const { domainName } = useParams()
  const { rootStore } = useStores()
  const [domainRecord, setDomainRecord] = useState<DomainRecord | null>()

  useEffect(() => {
    openWidgetsPageStore.loadDomainTx(domainName || name)
  }, [])

  useEffect(() => {
    rootStore.d1dcClient.getRecord({ name: domainName || name }).then((record) => {
      setDomainRecord(record)
    })
  }, [])

  useEffect(() => {
    setPlaceHolder('twitter handle or tweet link')
  }, [])

  
  const enterHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      setAddingWidget(true)
      const value = (event.target as HTMLInputElement).value
      if (value === '1' || value === 's') {
        setWidgetList([
          {
            type: '',
            value: 'http://twitter.com/stse/status/1477342465774342145',
          },
          ...widgetList,
        ])
        setAddingWidget(false)
        setFormFields({ ...formFields, widgetValue: '' })
        return
      }
      if (value.length > 0) {
        if (!widgetList.find((e) => e.value === value)) {
          setWidgetList([
            {
              type: 1,
              value: value,
            },
            ...widgetList,
          ])

          // const result = checkTweet(value)
          // setIsValid(result.error ? false : true)
          // if (result.value) {
          //   setWidgetList([
          //     {
          //       type: result.type,
          //       value: value,
          //     },
          //     ...widgetList,
          //   ])
          // } else {
          //   setErrorMessage(result.error)
          // }
        }
        setAddingWidget(false)
        setFormFields({ ...formFields, widgetValue: '' })
        errorMessage && setErrorMessage('')
      } else {
        setAddingWidget(false)
        setIsValid(false)
        setErrorMessage('Please type a tweet link or a twitter handle')
      }
    }
  }

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormFields({ ...formFields, [name]: value })
  }

  const deleteWidget = (value: string) => {
    const newWidgetList = widgetList.filter((w) => w.value !== value)
    setWidgetList(newWidgetList)
  }
  // console.log('DOMAIN RECORD', domainRecord)
  return (
    <PageWidgetContainer>
      {showAddButton && (
        <WidgetInputContainer>
          <WidgetStyledInput
            placeholder={placeHolder}
            name="widgetValue"
            value={formFields.widgetValue}
            required
            onChange={onChange}
            onKeyDown={enterHandler}
            disabled={addingWidget}
            valid={isValid}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
          />
          <span>{errorMessage}</span>
        </WidgetInputContainer>
      )}
      {domainRecord && (
        <TransactionWidget
          name={domainName || name}
          loading={openWidgetsPageStore.txDomainLoading}
          domainRecord={domainRecord}
          txHash={openWidgetsPageStore.txDomain}
        />
      )}
      {widgetList.map((widget, index) => (
        <MediaWidget
          type={1}
          value={widget.value}
          key={widget.value}
          deleteWidget={deleteWidget}
        />
      ))}
    </PageWidgetContainer>
  )
})

export default PageWidgets
