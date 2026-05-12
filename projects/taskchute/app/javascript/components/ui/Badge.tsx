import * as React from 'react'

import { cx } from '@/lib/utils'
import styles from './Badge.module.css'

type Variant = 'default' | 'outline' | 'muted' | 'accent' | 'success'

const variantClass: Record<Variant, string> = {
  default: styles.variantDefault,
  outline: styles.variantOutline,
  muted: styles.variantMuted,
  accent: styles.variantAccent,
  success: styles.variantSuccess,
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return <span className={cx(styles.root, variantClass[variant], className)} {...props} />
}
