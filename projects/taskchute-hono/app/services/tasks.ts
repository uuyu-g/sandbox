import { and, asc, eq, isNotNull, isNull, max, sql } from 'drizzle-orm'
import type { Db } from '@/db/client'
import { type Section, SECTIONS, tasks, type TaskRow } from '@/db/schema'
import { type TaskPayload, taskPayload } from '@/lib/payloads'

export type TaskInput = {
  title: string
  section?: Section
  estimate_minutes?: number
  scheduled_on?: string
  note?: string | null
  position?: number
  done?: boolean
}

export const listTasksForDate = async (db: Db, date: string): Promise<TaskPayload[]> => {
  const rows = await db
    .select()
    .from(tasks)
    .where(eq(tasks.scheduledOn, date))
    .orderBy(asc(tasks.section), asc(tasks.position), asc(tasks.id))
  return rows.map(taskPayload)
}

export const buildSummary = (
  tasks: ReadonlyArray<Pick<TaskPayload, 'estimate_minutes' | 'actual_minutes' | 'done'>>,
) => {
  const totals = { estimate: 0, actual: 0, done_count: 0, total_count: tasks.length }
  for (const t of tasks) {
    totals.estimate += t.estimate_minutes ?? 0
    if (t.actual_minutes != null) totals.actual += t.actual_minutes
    if (t.done) totals.done_count += 1
  }
  return totals
}

export const nextPositionForSection = async (
  db: Db,
  date: string,
  section: Section,
): Promise<number> => {
  const row = await db
    .select({ max: max(tasks.position) })
    .from(tasks)
    .where(and(eq(tasks.scheduledOn, date), eq(tasks.section, section)))
    .get()
  return (row?.max ?? -1) + 1
}

const findTask = async (db: Db, id: number): Promise<TaskRow | undefined> =>
  db.select().from(tasks).where(eq(tasks.id, id)).get()

export const createTask = async (db: Db, input: TaskInput, now: Date, fallbackDate: string): Promise<TaskRow> => {
  const section: Section = input.section ?? 'morning'
  const scheduledOn = input.scheduled_on ?? fallbackDate
  const position = input.position ?? (await nextPositionForSection(db, scheduledOn, section))
  const row = await db
    .insert(tasks)
    .values({
      title: input.title,
      section,
      estimateMinutes: input.estimate_minutes ?? 0,
      position,
      scheduledOn,
      note: input.note ?? null,
      done: input.done ?? false,
      createdAt: now,
      updatedAt: now,
    })
    .returning()
    .get()
  return row
}

export const updateTask = async (
  db: Db,
  id: number,
  input: Partial<TaskInput>,
  now: Date,
): Promise<TaskRow | undefined> => {
  const patch: Partial<typeof tasks.$inferInsert> = { updatedAt: now }
  if (input.title !== undefined) patch.title = input.title
  if (input.section !== undefined) patch.section = input.section
  if (input.estimate_minutes !== undefined) patch.estimateMinutes = input.estimate_minutes
  if (input.scheduled_on !== undefined) patch.scheduledOn = input.scheduled_on
  if (input.note !== undefined) patch.note = input.note
  if (input.position !== undefined) patch.position = input.position
  if (input.done !== undefined) patch.done = input.done
  return db.update(tasks).set(patch).where(eq(tasks.id, id)).returning().get()
}

export const deleteTask = async (db: Db, id: number): Promise<string | null> => {
  const existing = await findTask(db, id)
  if (!existing) return null
  await db.delete(tasks).where(eq(tasks.id, id))
  return existing.scheduledOn
}

export const startTask = async (db: Db, id: number, now: Date): Promise<TaskRow | undefined> =>
  db
    .update(tasks)
    .set({ startedAt: now, finishedAt: null, done: false, updatedAt: now })
    .where(eq(tasks.id, id))
    .returning()
    .get()

export const finishTask = async (db: Db, id: number, now: Date): Promise<TaskRow | undefined> => {
  const existing = await findTask(db, id)
  if (!existing) return undefined
  const started = existing.startedAt ?? now
  return db
    .update(tasks)
    .set({ startedAt: started, finishedAt: now, done: true, updatedAt: now })
    .where(eq(tasks.id, id))
    .returning()
    .get()
}

export const resetTask = async (db: Db, id: number, now: Date): Promise<TaskRow | undefined> =>
  db
    .update(tasks)
    .set({ startedAt: null, finishedAt: null, done: false, updatedAt: now })
    .where(eq(tasks.id, id))
    .returning()
    .get()

export const startNowTask = async (
  db: Db,
  date: string,
  section: Section,
  rawTitle: string,
  now: Date,
): Promise<TaskRow> => {
  const finishStmt = db
    .update(tasks)
    .set({ finishedAt: now, done: true, updatedAt: now })
    .where(
      and(
        eq(tasks.scheduledOn, date),
        isNotNull(tasks.startedAt),
        isNull(tasks.finishedAt),
      ),
    )

  const title = rawTitle.trim() || '無題のタスク'
  const position = await nextPositionForSection(db, date, section)
  const insertStmt = db
    .insert(tasks)
    .values({
      title,
      section,
      estimateMinutes: 0,
      position,
      scheduledOn: date,
      startedAt: now,
      done: false,
      createdAt: now,
      updatedAt: now,
    })
    .returning()

  const results = await db.batch([finishStmt, insertStmt])
  const inserted = results[1] as TaskRow[]
  return inserted[0]
}

export type ReorderItem = { id: number; section: Section; position: number }

export const reorderTasks = async (
  db: Db,
  items: ReadonlyArray<ReorderItem>,
  now: Date,
): Promise<void> => {
  if (items.length === 0) return
  const [first, ...rest] = items.map((item) =>
    db
      .update(tasks)
      .set({ section: item.section, position: item.position, updatedAt: now })
      .where(eq(tasks.id, item.id)),
  )
  await db.batch([first, ...rest])
}

export { SECTIONS }
