import React, { useState } from 'react'
import { Box } from 'grommet'
import { BaseText, Desc } from '../../components/Text'
import { ModalContent } from './ModalContent'
import config from '../../../config'
import styled from 'styled-components'
import { ModalRenderProps } from '../../modules/modals'

export interface CreateTokenForm {
  name: string
  symbol: string
  description: string
  image: string
}

interface Props extends ModalRenderProps {
  onSubmit: (data: CreateTokenForm) => Promise<void>
  userAddress?: string
}

const StyledInput = styled.input`
  width: 100%;
  padding: 8px;
  margin: 8px 0;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  &:focus {
    outline: none;
    border-color: #40a9ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }
`

const StyledTextArea = styled.textarea`
  width: 100%;
  padding: 8px;
  margin: 8px 0;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  resize: vertical;
  min-height: 100px;
  &:focus {
    outline: none;
    border-color: #40a9ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }
`

const FileUploadArea = styled.div`
  border: 2px dashed #d9d9d9;
  border-radius: 4px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  margin: 8px 0;
  &:hover {
    border-color: #40a9ff;
  }
`

const StyledButton = styled.button`
  width: 100%;
  padding: 8px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:disabled {
    background: #d9d9d9;
    cursor: not-allowed;
  }
`

const defaultFormState: CreateTokenForm = {
  name: '',
  symbol: '',
  description: '',
  image: '',
}

const ModalMemeToken: React.FC<Props> = ({ onSubmit, userAddress }) => {
  const [form, setForm] = useState<CreateTokenForm>(defaultFormState)
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
      setForm(defaultFormState)
    } catch (error) {
      console.error('Failed to create token:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ModalContent>
      <Box gap="16px">
        <Box>
          <BaseText>Create Meme Token</BaseText>
          <Desc>
            Create your own meme token with custom image and description
          </Desc>
        </Box>

        <Box>
          <BaseText>Name</BaseText>
          <StyledInput
            value={form.name}
            onChange={handleInputChange('name')}
            placeholder="Token name"
          />
        </Box>

        <Box>
          <BaseText>Symbol</BaseText>
          <StyledInput
            value={form.symbol}
            onChange={handleInputChange('symbol')}
            placeholder="Token symbol"
          />
        </Box>

        <Box>
          <BaseText>Description</BaseText>
          <StyledTextArea
            value={form.description}
            onChange={handleInputChange('description')}
            placeholder="Token description"
          />
        </Box>

        <Box>
          <BaseText>Image</BaseText>
          <FileUploadArea>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="file-upload"
            />
            <label htmlFor="file-upload">Click or drag file to upload</label>
          </FileUploadArea>
          {form.image && <BaseText>Image uploaded successfully</BaseText>}
        </Box>

        <StyledButton
          disabled={!form.name || !form.symbol || isLoading}
          onClick={handleSubmit}
        >
          {isLoading ? 'Creating...' : 'Create Token'}
        </StyledButton>
      </Box>
    </ModalContent>
  )
}

export default ModalMemeToken
