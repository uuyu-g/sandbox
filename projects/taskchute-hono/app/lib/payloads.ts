import type { RoutineTemplateRow, TaskRow } from '@/db/schema'
import { weekdaysFromMask } from '@/services/weekdays'

export type TaskPayload = {
  id: number
  title: string
  section: string
  estimate_minutes: number
  position: number
  scheduled_on: string
  started_at: string | null
  finished_at: string | null
  actual_minutes: number | null
  done: boolean
  in_progress: boolean
  note: string | null
  routine_template_id: number | null
}

export type RoutinePayload = {
  id: number
  title: string
  section: string
  estimate_minutes: number
  position: number
  weekdays: number[]
  weekdays_mask: number
  active: boolean
  note: string | null
}

const isoOrNull = (d: Date | null | undefined): string | null =>
  d ? d.toISOString() : null

export const taskPayload = (t: TaskRow): TaskPayload => {
  const started = t.startedAt ? t.startedAt.getTime() : null
  const finished = t.finishedAt ? t.finishedAt.getTime() : null
  const actual =
    started != null && finished != null
      ? Math.max(0, Math.round((finished - started) / 60000))
      : null
  return {
    id: t.id,
    title: t.title,
    section: t.section,
    estimate_minutes: t.estimateMinutes,
    position: t.position,
    scheduled_on: t.scheduledOn,
    started_at: isoOrNull(t.startedAt),
    finished_at: isoOrNull(t.finishedAt),
    actual_minutes: actual,
    done: t.done,
    in_progress: started != null && finished == null,
    note: t.note,
    routine_template_id: t.routineTemplateId,
  }
}

export const routinePayload = (r: RoutineTemplateRow): RoutinePayload => ({
  id: r.id,
  title: r.title,
  section: r.section,
  estimate_minutes: r.estimateMinutes,
  position: r.position,
  weekdays: weekdaysFromMask(r.weekdaysMask),
  weekdays_mask: r.weekdaysMask,
  active: r.active,
  note: r.note,
})
