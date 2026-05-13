import type { KeyboardEvent } from 'react'

export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

export function onEnterKey<T extends HTMLElement>(
  handler: (e: KeyboardEvent<T>) => void,
) {
  return (e: KeyboardEvent<T>) => {
    if (e.key !== 'Enter') return
    if (e.nativeEvent.isComposing) return
    handler(e)
  }
}
