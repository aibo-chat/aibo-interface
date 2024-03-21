import React, { CSSProperties } from 'react'
import './Text.scss'

interface ITextProps {
  className?: string
  style?: CSSProperties
  variant?: 'h1' | 'h2' | 's1' | 'b1' | 'b2' | 'b3'
  weight?: 'light' | 'normal' | 'medium' | 'bold'
  primary?: boolean
  span?: boolean
  children: React.ReactNode
}
const Text: React.FC<ITextProps> = ({ children, className, style, variant = 'b1', weight = 'normal', primary = false, span = false }) => {
  const classes = []
  if (className) classes.push(className)

  classes.push(`text text-${variant} text-${weight}`)
  if (primary) classes.push('font-primary')

  const textClass = classes.join(' ')
  if (span)
    return (
      <span className={textClass} style={style}>
        {children}
      </span>
    )
  if (variant === 'h1')
    return (
      <h1 className={textClass} style={style}>
        {children}
      </h1>
    )
  if (variant === 'h2')
    return (
      <h2 className={textClass} style={style}>
        {children}
      </h2>
    )
  if (variant === 's1')
    return (
      <h4 className={textClass} style={style}>
        {children}
      </h4>
    )
  return (
    <p className={textClass} style={style}>
      {children}
    </p>
  )
}

export default Text
