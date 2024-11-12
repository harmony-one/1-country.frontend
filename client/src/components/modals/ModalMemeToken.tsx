import React, { useState } from 'react'
// import { X } from 'lucide-react'
import { Box, Layer } from 'grommet'
import {
  StyledBox,
  ModalWrapper,
  FormField,
  Label,
  Input,
  TextArea,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  FileUploadContainer,
  FileUploadLabel,
  SubmitButton,
  CloseButtonContainer,
  CloseButton,
  SuccessMessage,
} from './Modals.styles'
import config from '../../../config'

export interface CreateTokenForm {
  name: string
  symbol: string
  description: string
  image: string
}

interface Props {
  onSubmit: (data: CreateTokenForm) => Promise<void>
  userAddress?: string
  onClose: () => void
}

const ModalMemeToken: React.FC<Props> = ({
  onSubmit,
  userAddress,
  onClose,
}) => {
  const [form, setForm] = useState<CreateTokenForm>({
    name: '',
    symbol: '',
    description: '',
    image: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange =
    (field: keyof CreateTokenForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({
        ...prev,
        [field]:
          field === 'symbol' ? e.target.value.toUpperCase() : e.target.value,
      }))
    }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('meta_user_address', userAddress || '')
      formData.append('meta_file_name', userAddress || '')

      try {
        const response = await fetch(`${config.pumpfun.apiUrl}/uploadImage`, {
          method: 'POST',
          body: formData,
        })
        const imageUrl = await response.text()
        setForm((prev) => ({ ...prev, image: imageUrl }))
      } catch (error) {
        console.error('Failed to upload image:', error)
      }
    }
  }

  const handleSubmit = async () => {
    try {
      setIsLoading(true)
      await onSubmit(form)
    } catch (error) {
      console.error('Failed to create token:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ModalWrapper>
      <StyledBox>
        <CloseButtonContainer>
          <CloseButton onClick={onClose}>X</CloseButton>
        </CloseButtonContainer>

        <ModalHeader>
          <ModalTitle>Create Meme Token</ModalTitle>
          <ModalDescription>
            Create your own meme token with custom image and description
          </ModalDescription>
        </ModalHeader>

        <FormField>
          <Label>Name</Label>
          <Input
            value={form.name}
            onChange={handleInputChange('name')}
            placeholder="Token name"
          />
        </FormField>

        <FormField>
          <Label>Symbol</Label>
          <Input
            value={form.symbol}
            onChange={handleInputChange('symbol')}
            placeholder="Token symbol"
          />
        </FormField>

        <FormField>
          <Label>Description</Label>
          <TextArea
            value={form.description}
            onChange={handleInputChange('description')}
            placeholder="Token description"
          />
        </FormField>

        <FormField>
          <Label>Image</Label>
          <FileUploadContainer>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              id="file-upload"
              style={{ display: 'none' }}
            />
            <FileUploadLabel htmlFor="file-upload">
              Click or drag file to upload
            </FileUploadLabel>
          </FileUploadContainer>
          {form.image && (
            <SuccessMessage>Image uploaded successfully</SuccessMessage>
          )}
        </FormField>

        <SubmitButton
          disabled={!form.name || !form.symbol || isLoading}
          onClick={handleSubmit}
        >
          {isLoading ? 'Creating...' : 'Create Token'}
        </SubmitButton>
      </StyledBox>
    </ModalWrapper>
  )
}

export default ModalMemeToken
