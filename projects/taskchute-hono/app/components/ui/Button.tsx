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
  ...props
}: ButtonProps) {
  return <button type={type} data-variant={variant} data-size={size} {...props} />
}
