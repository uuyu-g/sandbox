import { describe, expect, it } from 'vitest'
import { parseIsoDate, weekdayOf } from '@/lib/date'

describe('parseIsoDate', () => {
  it('accepts valid ISO date strings', () => {
    expect(parseIsoDate('2026-05-13')).toBe('2026-05-13')
  })

  it('rejects malformed strings', () => {
    expect(parseIsoDate('2026/05/13')).toBeNull()
    expect(parseIsoDate('bogus')).toBeNull()
    expect(parseIsoDate(null)).toBeNull()
    expect(parseIsoDate('')).toBeNull()
  })
})

describe('weekdayOf', () => {
  it('returns Wednesday=3 for 2026-05-13', () => {
    expect(weekdayOf('2026-05-13')).toBe(3)
  })

  it('returns Sunday=0 for 2026-01-04', () => {
    expect(weekdayOf('2026-01-04')).toBe(0)
  })
})
