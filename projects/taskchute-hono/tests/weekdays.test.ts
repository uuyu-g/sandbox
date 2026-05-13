import { describe, expect, it } from 'vitest'
import {
  ALL_WEEKDAYS_MASK,
  weekdayMaskFromArray,
  weekdayMaskMatches,
  weekdaysFromMask,
} from '@/services/weekdays'

describe('weekdays bitmask', () => {
  it('matches every day when mask is full', () => {
    for (let w = 0; w < 7; w++) {
      expect(weekdayMaskMatches(ALL_WEEKDAYS_MASK, w)).toBe(true)
    }
  })

  it('matches nothing when mask is zero', () => {
    for (let w = 0; w < 7; w++) {
      expect(weekdayMaskMatches(0, w)).toBe(false)
    }
  })

  it('round-trips through array and mask', () => {
    const days = [1, 3, 5]
    const mask = weekdayMaskFromArray(days)
    expect(weekdaysFromMask(mask)).toEqual(days)
  })

  it('weekdayMaskFromArray for Mon-Fri equals 0b0111110 (62)', () => {
    expect(weekdayMaskFromArray([1, 2, 3, 4, 5])).toBe(62)
  })
})
