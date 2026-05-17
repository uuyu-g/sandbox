import * as React from 'react'

type Variant = 'default' | 'outline' | 'muted' | 'accent' | 'success'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant
}

export function Badge({ variant = 'default', ...props }: BadgeProps) {
  return <span data-badge data-variant={variant} {...props} />
}
