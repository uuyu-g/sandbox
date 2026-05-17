import type { KeyboardEvent } from 'react'

export function onEnterKey<T extends HTMLElement>(
  handler: (e: KeyboardEvent<T>) => void,
) {
  return (e: KeyboardEvent<T>) => {
    if (e.key !== 'Enter') return
    if (e.nativeEvent.isComposing) return
    handler(e)
  }
}
