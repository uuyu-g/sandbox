import * as React from 'react'

type Variant = 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive'
type Size = 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export function Button({
  variant = 'default',
  size = 'default',
  type = 'button',
  className,
  ...props
}: ButtonProps) {
  const classes = ['btn', `btn-${variant}`]
  if (size !== 'default') classes.push(`btn-${size}`)
  if (className) classes.push(className)
  return <button type={type} className={classes.join(' ')} {...props} />
}
