import * as React from 'react'

type Variant = 'default' | 'outline' | 'muted' | 'accent' | 'success'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant
}

export function Badge({ variant = 'default', className, ...props }: BadgeProps) {
  const classes = [variant]
  if (className) classes.push(className)
  return <span className={classes.join(' ')} {...props} />
}
