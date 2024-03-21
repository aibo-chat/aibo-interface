import React, { JSXElementConstructor, ReactElement } from 'react'
import './Tooltip.scss'
import Tippy from '@tippyjs/react'
import { Placement } from 'tippy.js'

interface ITooltipProps {
  className?: string
  placement?: Placement
  content: React.ReactNode
  delay?: number | [number | null, number | null]
  children: ReactElement<any, string | JSXElementConstructor<any>> | undefined
}

const Tooltip: React.FC<ITooltipProps> = ({ className = '', placement = 'top', content, delay = [200, 0], children }) => (
  <Tippy content={content} className={`tooltip ${className}`} touch="hold" arrow={false} maxWidth={250} placement={placement} delay={delay} duration={[100, 0]}>
    {children}
  </Tippy>
)

export default Tooltip
