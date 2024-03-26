import React, { ChangeEventHandler, CompositionEventHandler, KeyboardEventHandler, Ref } from 'react'
import { Box, InputBase } from '@mui/material'

interface IInputProps {
  id?: string
  name?: string
  label?: string
  value?: string
  placeholder?: string
  required?: boolean
  type?: string
  onChange?: ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> | undefined
  onCompositionEnd?: CompositionEventHandler<HTMLInputElement>
  forwardRef?: Ref<HTMLTextAreaElement> | Ref<HTMLInputElement>
  resizable?: boolean
  minHeight?: number
  onResize?: (e: Event) => void
  state?: 'normal' | 'success' | 'error'
  onKeyDown?: KeyboardEventHandler<HTMLTextAreaElement> | KeyboardEventHandler<HTMLInputElement>
  disabled?: boolean
  autoFocus?: boolean
  controlledValue?: string
  icon?: React.ReactNode
}
export const AuthInput: React.FC<IInputProps> = ({
  id,
  name = '',
  label = '',
  value = '',
  placeholder = '',
  type = 'text',
  required = false,
  onChange,
  onCompositionEnd,
  forwardRef = null,
  resizable = false,
  minHeight = 46,
  onResize,
  state = 'normal',
  onKeyDown,
  disabled = false,
  autoFocus = false,
  controlledValue,
  icon,
}) => (
  <Box
    sx={{
      width: '100%',
      height: '48px',
      borderRadius: '8px',
      backgroundColor: '#FFF',
      display: 'flex',
      alignItems: 'center',
      padding: '12px 16px',
    }}
  >
    {icon || null}
    <InputBase
      sx={{
        flex: 1,
        overflow: 'hidden',
        height: '100%',
        fontSize: '16px',
        fontWeight: 400,
        lineHeight: '20px',
      }}
      value={value}
      onChange={onChange}
      required={required}
      name={name}
      placeholder={placeholder}
      type={type}
    />
  </Box>
)
