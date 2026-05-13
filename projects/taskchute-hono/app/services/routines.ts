import { and, asc, eq, inArray, max } from 'drizzle-orm'
import type { Db } from '@/db/client'
import {
  type RoutineTemplateRow,
  routineTemplates,
  type Section,
  SECTIONS,
  tasks,
  type TaskRow,
} from '@/db/schema'
import { weekdayMaskFromArray, weekdayMaskMatches } from '@/services/weekdays'
import { weekdayOf } from '@/lib/date'

export type RoutineInput = {
  title: string
  section?: Section
  estimate_minutes?: number
  position?: number
  weekdays?: number[]
  active?: boolean
  note?: string | null
}

export const listRoutines = async (db: Db): Promise<RoutineTemplateRow[]> =>
  db
    .select()
    .from(routineTemplates)
    .orderBy(asc(routineTemplates.section), asc(routineTemplates.position), asc(routineTemplates.id))

export const nextRoutinePosition = async (db: Db, section: Section): Promise<number> => {
  const row = await db
    .select({ max: max(routineTemplates.position) })
    .from(routineTemplates)
    .where(eq(routineTemplates.section, section))
    .get()
  return (row?.max ?? -1) + 1
}

export const createRoutine = async (
  db: Db,
  input: RoutineInput,
  now: Date,
): Promise<RoutineTemplateRow> => {
  const section: Section = input.section ?? 'morning'
  const weekdays = input.weekdays && input.weekdays.length > 0 ? input.weekdays : [0, 1, 2, 3, 4, 5, 6]
  const position = input.position ?? (await nextRoutinePosition(db, section))
  return db
    .insert(routineTemplates)
    .values({
      title: input.title,
      section,
      estimateMinutes: input.estimate_minutes ?? 0,
      position,
      weekdaysMask: weekdayMaskFromArray(weekdays),
      active: input.active ?? true,
      note: input.note ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .returning()
    .get()
}

export const updateRoutine = async (
  db: Db,
  id: number,
  input: Partial<RoutineInput>,
  now: Date,
): Promise<RoutineTemplateRow | undefined> => {
  const patch: Partial<typeof routineTemplates.$inferInsert> = { updatedAt: now }
  if (input.title !== undefined) patch.title = input.title
  if (input.section !== undefined) patch.section = input.section
  if (input.estimate_minutes !== undefined) patch.estimateMinutes = input.estimate_minutes
  if (input.position !== undefined) patch.position = input.position
  if (input.active !== undefined) patch.active = input.active
  if (input.note !== undefined) patch.note = input.note
  if (input.weekdays !== undefined) {
    const ws = input.weekdays.length > 0 ? input.weekdays : [0, 1, 2, 3, 4, 5, 6]
    patch.weekdaysMask = weekdayMaskFromArray(ws)
  }
  return db
    .update(routineTemplates)
    .set(patch)
    .where(eq(routineTemplates.id, id))
    .returning()
    .get()
}

export const deleteRoutine = async (db: Db, id: number): Promise<void> => {
  await db.delete(routineTemplates).where(eq(routineTemplates.id, id))
}

export type ExpandResult = { created_count: number; tasks: TaskRow[] }

export const expandRoutines = async (db: Db, date: string, now: Date): Promise<ExpandResult> => {
  const weekday = weekdayOf(date)
  const active = await db
    .select()
    .from(routineTemplates)
    .where(eq(routineTemplates.active, true))
    .orderBy(asc(routineTemplates.section), asc(routineTemplates.position), asc(routineTemplates.id))

  const candidates = active.filter((r) => weekdayMaskMatches(r.weekdaysMask, weekday))
  if (candidates.length === 0) return { created_count: 0, tasks: [] }

  const existing = await db
    .select({ routineTemplateId: tasks.routineTemplateId })
    .from(tasks)
    .where(
      and(
        eq(tasks.scheduledOn, date),
        inArray(
          tasks.routineTemplateId,
          candidates.map((r) => r.id),
        ),
      ),
    )
  const alreadyExpanded = new Set(
    existing.map((row) => row.routineTemplateId).filter((id): id is number => id != null),
  )

  const sectionMax = new Map<Section, number>()
  for (const s of SECTIONS) {
    const row = await db
      .select({ max: max(tasks.position) })
      .from(tasks)
      .where(and(eq(tasks.scheduledOn, date), eq(tasks.section, s)))
      .get()
    sectionMax.set(s, row?.max ?? -1)
  }

  const toInsert = candidates
    .filter((r) => !alreadyExpanded.has(r.id))
    .map((r) => {
      const next = (sectionMax.get(r.section) ?? -1) + 1
      sectionMax.set(r.section, next)
      return {
        title: r.title,
        section: r.section,
        estimateMinutes: r.estimateMinutes,
        position: next,
        scheduledOn: date,
        note: r.note,
        routineTemplateId: r.id,
        done: false,
        createdAt: now,
        updatedAt: now,
      }
    })

  if (toInsert.length === 0) return { created_count: 0, tasks: [] }

  const inserted = await db.insert(tasks).values(toInsert).returning()
  return { created_count: inserted.length, tasks: inserted }
}
