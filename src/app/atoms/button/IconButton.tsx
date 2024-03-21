import React, { MouseEventHandler } from 'react'
import './IconButton.scss'

import RawIcon from '../system-icons/RawIcon'
import Tooltip from '../tooltip/Tooltip'
import { blurOnBubbling } from './script'
import Text from '../text/Text'

interface IIconButtonProps {
  variant?: 'surface' | 'primary' | 'positive' | 'caution' | 'danger'
  size?: 'normal' | 'small' | 'extra-small'
  type?: 'button' | 'submit' | 'reset'
  tooltip?: string
  tooltipPlacement?: 'top' | 'right' | 'bottom' | 'left'
  src: string
  onClick?: MouseEventHandler<HTMLButtonElement>
  tabIndex?: number
  disabled?: boolean
  isImage?: boolean
  className?: string
}
const IconButton = React.forwardRef<any, IIconButtonProps>(
  ({ variant = 'surface', size = 'normal', type = 'button', tooltip, tooltipPlacement = 'top', src, onClick, tabIndex = 0, disabled = false, isImage = false, className = '' }, ref) => {
    const btn = (
      <button
        ref={ref}
        className={`ic-btn ic-btn-${variant} ${className}`}
        onMouseUp={(e) => blurOnBubbling(e as any, `.ic-btn-${variant}`)}
        onClick={onClick}
        // eslint-disable-next-line react/button-has-type
        type={type}
        tabIndex={tabIndex}
        disabled={disabled}
      >
        <RawIcon size={size} src={src} isImage={isImage} />
      </button>
    )
    if (!tooltip) return btn
    return (
      <Tooltip placement={tooltipPlacement} content={<Text variant="b2">{tooltip}</Text>}>
        {btn}
      </Tooltip>
    )
  },
)

export default IconButton
