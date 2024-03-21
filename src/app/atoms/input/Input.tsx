import React, { ChangeEventHandler, CompositionEventHandler, FormEventHandler, KeyboardEventHandler, Ref } from 'react'
import './Input.scss'

import TextareaAutosize from 'react-autosize-textarea'

interface IInputProps {
  id?: string
  name?: string
  label?: string
  value?: string
  placeholder?: string
  required?: boolean
  type?: string
  onChange?: FormEventHandler<HTMLTextAreaElement> | ChangeEventHandler<HTMLInputElement>
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
}
const Input: React.FC<IInputProps> = ({
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
}) => (
  <div className="input-container">
    {label !== '' && (
      <label className="input__label text-b2" htmlFor={id}>
        {label}
      </label>
    )}
    {resizable ? (
      <TextareaAutosize
        dir="auto"
        style={{ minHeight: `${minHeight}px` }}
        name={name}
        id={id}
        className={`input input--resizable${state !== 'normal' ? ` input--${state}` : ''}`}
        ref={forwardRef as Ref<HTMLTextAreaElement>}
        type={type}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        onChange={onChange as FormEventHandler<HTMLTextAreaElement>}
        onResize={onResize}
        onKeyDown={onKeyDown as KeyboardEventHandler<HTMLTextAreaElement>}
        disabled={disabled}
        autoFocus={autoFocus}
        {...(controlledValue !== undefined ? { value: controlledValue } : { defaultValue: value })}
      />
    ) : (
      <input
        dir="auto"
        ref={forwardRef as Ref<HTMLInputElement>}
        id={id}
        name={name}
        className={`input ${state !== 'normal' ? ` input--${state}` : ''}`}
        type={type}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        onChange={onChange as ChangeEventHandler<HTMLInputElement>}
        onKeyDown={onKeyDown as KeyboardEventHandler<HTMLInputElement>}
        disabled={disabled}
        onCompositionEnd={onCompositionEnd}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={autoFocus}
        {...(controlledValue !== undefined ? { value: controlledValue } : { defaultValue: value })}
      />
    )}
  </div>
)

export default Input
