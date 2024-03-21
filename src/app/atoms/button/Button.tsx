import React, { CSSProperties, MouseEventHandler } from 'react'
import './Button.scss'

import Text from '../text/Text'
import RawIcon from '../system-icons/RawIcon'
import { blurOnBubbling } from './script'

interface IButtonProps {
  id?: string
  className?: string
  variant?: 'surface' | 'primary' | 'positive' | 'caution' | 'danger'
  iconSrc?: string
  type?: 'button' | 'submit' | 'reset'
  onClick?: MouseEventHandler<HTMLButtonElement>
  children: any
  disabled?: boolean
  style?: CSSProperties
}
const Button = React.forwardRef<HTMLButtonElement | null, IButtonProps>(({ id = '', className, variant = 'surface', iconSrc, type = 'button', onClick, children, disabled = false, style }, ref) => {
  const iconClass = iconSrc ? `btn-${variant}--icon` : ''
  return (
    <button
      ref={ref}
      id={id === '' ? undefined : id}
      className={`${className ? `${className} ` : ''}btn-${variant} ${iconClass} noselect`}
      onMouseUp={(e) => blurOnBubbling(e as unknown as Event, `.btn-${variant}`)}
      onClick={onClick}
      // eslint-disable-next-line react/button-has-type
      type={type}
      disabled={disabled}
      style={style}
    >
      {iconSrc ? <RawIcon size="small" src={iconSrc} /> : null}
      {typeof children === 'string' && <Text variant="b1">{children}</Text>}
      {typeof children !== 'string' && children}
    </button>
  )
})

export default Button
