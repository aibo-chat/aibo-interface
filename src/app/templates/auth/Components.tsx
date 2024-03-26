import React, { ChangeEventHandler } from 'react'
import { Box, InputBase } from '@mui/material'

interface IInputProps {
  name?: string
  value?: string
  placeholder?: string
  required?: boolean
  type?: string
  onChange?: ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> | undefined
  icon?: React.ReactNode
}
export const AuthInput: React.FC<IInputProps> = ({ name = '', value = '', placeholder = '', type = 'text', required = false, onChange, icon }) => (
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
