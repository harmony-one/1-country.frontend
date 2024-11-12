import styled from 'styled-components'
import { Box } from 'grommet'

export const StyledBox = styled(Box)`
  width: 100%;
  padding: 24px;
  position: relative;
  box-sizing: border-box;
`

export const ModalWrapper = styled.div`
  width: 100%;
  max-width: 480px;
  min-width: 320px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  position: relative;
  margin: auto;
`

export const FormField = styled.div`
  width: 100%;
  margin-bottom: 16px;
`

export const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #374151;
`

export const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
  }

  &::placeholder {
    color: #9ca3af;
  }
`

export const TextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
  }

  &::placeholder {
    color: #9ca3af;
  }
`

export const ModalHeader = styled.div`
  margin-bottom: 24px;
`

export const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 8px 0;
  color: #111827;
`

export const ModalDescription = styled.p`
  color: #666;
  font-size: 14px;
  margin: 0;
`

export const FileUploadContainer = styled.div`
  border: 2px dashed #d1d5db;
  border-radius: 6px;
  padding: 20px;
  text-align: center;
  margin-top: 8px;
  cursor: pointer;
  transition: border-color 0.2s;

  &:hover {
    border-color: #2563eb;
  }
`

export const FileUploadLabel = styled.label`
  cursor: pointer;
  color: #2563eb;
  font-size: 14px;

  &:hover {
    color: #1d4ed8;
  }
`

export const SubmitButton = styled.button<{ disabled?: boolean }>`
  width: 100%;
  padding: 10px;
  background-color: ${(props) => (props.disabled ? '#d1d5db' : '#3b82f6')};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background-color: #2563eb;
  }
`

export const CloseButtonContainer = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
`

export const CloseButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  svg {
    width: 20px;
    height: 20px;
    color: #666;
  }
`

export const SuccessMessage = styled.p`
  color: #059669;
  font-size: 14px;
  margin: 8px 0 0 0;
`
