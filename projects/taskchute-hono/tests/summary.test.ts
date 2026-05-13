import { describe, expect, it } from 'vitest'
import { buildSummary } from '@/services/tasks'

describe('buildSummary', () => {
  it('returns zeros for empty input', () => {
    expect(buildSummary([])).toEqual({ estimate: 0, actual: 0, done_count: 0, total_count: 0 })
  })

  it('aggregates estimate, actual, done', () => {
    const tasks = [
      { estimate_minutes: 10, actual_minutes: 12, done: true },
      { estimate_minutes: 20, actual_minutes: null, done: false },
      { estimate_minutes: 5, actual_minutes: 3, done: true },
    ]
    expect(buildSummary(tasks)).toEqual({
      estimate: 35,
      actual: 15,
      done_count: 2,
      total_count: 3,
    })
  })
})
