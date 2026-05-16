import { sql } from 'drizzle-orm'
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const SECTIONS = ['morning', 'noon', 'night'] as const
export type Section = (typeof SECTIONS)[number]

export const routineTemplates = sqliteTable('routine_templates', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  section: text('section', { enum: SECTIONS }).notNull().default('morning'),
  estimateMinutes: integer('estimate_minutes').notNull().default(0),
  position: integer('position').notNull().default(0),
  weekdaysMask: integer('weekdays_mask').notNull().default(127),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  note: text('note'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
})

export const tasks = sqliteTable(
  'tasks',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    title: text('title').notNull(),
    section: text('section', { enum: SECTIONS }).notNull().default('morning'),
    estimateMinutes: integer('estimate_minutes').notNull().default(0),
    position: integer('position').notNull().default(0),
    scheduledOn: text('scheduled_on').notNull(),
    startedAt: integer('started_at', { mode: 'timestamp_ms' }),
    finishedAt: integer('finished_at', { mode: 'timestamp_ms' }),
    done: integer('done', { mode: 'boolean' }).notNull().default(false),
    note: text('note'),
    routineTemplateId: integer('routine_template_id').references(() => routineTemplates.id, {
      onDelete: 'set null',
    }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
  },
  (t) => ({
    byDateSectionPos: index('idx_tasks_on_scheduled_on_section_position').on(
      t.scheduledOn,
      t.section,
      t.position,
    ),
    byRoutine: index('idx_tasks_on_routine_template_id').on(t.routineTemplateId),
  }),
)

export type TaskRow = typeof tasks.$inferSelect
export type RoutineTemplateRow = typeof routineTemplates.$inferSelect
