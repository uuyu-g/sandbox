import { describe, expect, it } from 'vitest'
import type { TaskRow } from '@/db/schema'
import { taskPayload } from '@/lib/payloads'

const baseRow = (): TaskRow => ({
  id: 1,
  title: 'sample',
  section: 'morning',
  estimateMinutes: 10,
  position: 0,
  scheduledOn: '2026-05-13',
  startedAt: null,
  finishedAt: null,
  done: false,
  note: null,
  routineTemplateId: null,
  createdAt: new Date(0),
  updatedAt: new Date(0),
})

describe('taskPayload', () => {
  it('computes actual_minutes from started/finished', () => {
    const row = baseRow()
    row.startedAt = new Date('2026-05-13T08:00:00Z')
    row.finishedAt = new Date('2026-05-13T08:12:00Z')
    row.done = true
    expect(taskPayload(row).actual_minutes).toBe(12)
  })

  it('returns null actual when not finished', () => {
    const row = baseRow()
    row.startedAt = new Date('2026-05-13T08:00:00Z')
    const p = taskPayload(row)
    expect(p.actual_minutes).toBeNull()
    expect(p.in_progress).toBe(true)
  })

  it('returns null actual when not started', () => {
    expect(taskPayload(baseRow()).actual_minutes).toBeNull()
    expect(taskPayload(baseRow()).in_progress).toBe(false)
  })
})
