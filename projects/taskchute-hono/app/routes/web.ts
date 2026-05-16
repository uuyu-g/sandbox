import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'

import { makeDb } from '@/db/client'
import { SECTIONS } from '@/db/schema'
import type { AppEnv } from '@/env'
import { parseIsoDate, sectionForTime, todayIso } from '@/lib/date'
import { routinePayload } from '@/lib/payloads'
import * as Routines from '@/services/routines'
import * as Tasks from '@/services/tasks'

const sectionSchema = z.enum(SECTIONS)

const taskCreateSchema = z.object({
  task: z.object({
    title: z.string().trim().min(1),
    section: sectionSchema.optional(),
    estimate_minutes: z.coerce.number().int().min(0).optional(),
    scheduled_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    note: z.string().nullable().optional(),
    position: z.coerce.number().int().min(0).optional(),
    done: z.boolean().optional(),
  }),
})

const taskUpdateSchema = z.object({
  task: z.object({
    title: z.string().trim().min(1).optional(),
    section: sectionSchema.optional(),
    estimate_minutes: z.coerce.number().int().min(0).optional(),
    scheduled_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    note: z.string().nullable().optional(),
    position: z.coerce.number().int().min(0).optional(),
    done: z.boolean().optional(),
  }),
})

const reorderSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  items: z.array(
    z.object({
      id: z.coerce.number().int(),
      section: sectionSchema,
      position: z.coerce.number().int().min(0),
    }),
  ),
})

const routineSchema = z.object({
  routine_template: z.object({
    title: z.string().trim().min(1).optional(),
    section: sectionSchema.optional(),
    estimate_minutes: z.coerce.number().int().min(0).optional(),
    position: z.coerce.number().int().min(0).optional(),
    weekdays: z.array(z.coerce.number().int().min(0).max(6)).optional(),
    active: z.boolean().optional(),
    note: z.string().nullable().optional(),
  }),
})

const expandSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

const startNowSchema = z.object({
  task: z
    .object({
      title: z.string().optional(),
    })
    .optional(),
})

const withDate = (path: string, date: string, extra?: Record<string, string>): string => {
  const params = new URLSearchParams({ date, ...(extra ?? {}) })
  return `${path}?${params.toString()}`
}

export const web = new Hono<AppEnv>()

web.get('/', async (c) => {
  const db = makeDb(c.env.DB)
  const date = parseIsoDate(c.req.query('date')) ?? todayIso(c.env.DEFAULT_TZ)
  const notice = c.req.query('notice') ?? null
  const tasks = await Tasks.listTasksForDate(db, date)
  const summary = Tasks.buildSummary(tasks)
  return c.render('Today', {
    date,
    tasks,
    summary,
    sections: SECTIONS,
    flash: { notice },
  })
})

web.post('/tasks', zValidator('json', taskCreateSchema), async (c) => {
  const db = makeDb(c.env.DB)
  const { task } = c.req.valid('json')
  const now = new Date()
  const fallbackDate = todayIso(c.env.DEFAULT_TZ)
  const row = await Tasks.createTask(db, task, now, fallbackDate)
  return c.redirect(withDate('/', row.scheduledOn), 303)
})

web.post('/tasks/start_now', zValidator('json', startNowSchema), async (c) => {
  const db = makeDb(c.env.DB)
  const now = new Date()
  const date = todayIso(c.env.DEFAULT_TZ)
  const section = sectionForTime(now, c.env.DEFAULT_TZ)
  const title = c.req.valid('json').task?.title ?? ''
  await Tasks.startNowTask(db, date, section, title, now)
  return c.redirect(withDate('/', date), 303)
})

web.patch('/tasks/reorder', zValidator('json', reorderSchema), async (c) => {
  const db = makeDb(c.env.DB)
  const { items, date } = c.req.valid('json')
  await Tasks.reorderTasks(db, items, new Date())
  const target = date ?? todayIso(c.env.DEFAULT_TZ)
  return c.redirect(withDate('/', target), 303)
})

web.patch('/tasks/:id{[0-9]+}', zValidator('json', taskUpdateSchema), async (c) => {
  const db = makeDb(c.env.DB)
  const id = Number(c.req.param('id'))
  const { task } = c.req.valid('json')
  const row = await Tasks.updateTask(db, id, task, new Date())
  if (!row) return c.notFound()
  return c.redirect(withDate('/', row.scheduledOn), 303)
})

web.delete('/tasks/:id{[0-9]+}', async (c) => {
  const db = makeDb(c.env.DB)
  const id = Number(c.req.param('id'))
  const scheduledOn = await Tasks.deleteTask(db, id)
  if (!scheduledOn) return c.notFound()
  return c.redirect(withDate('/', scheduledOn), 303)
})

web.post('/tasks/:id{[0-9]+}/start', async (c) => {
  const db = makeDb(c.env.DB)
  const id = Number(c.req.param('id'))
  const row = await Tasks.startTask(db, id, new Date())
  if (!row) return c.notFound()
  return c.redirect(withDate('/', row.scheduledOn), 303)
})

web.post('/tasks/:id{[0-9]+}/finish', async (c) => {
  const db = makeDb(c.env.DB)
  const id = Number(c.req.param('id'))
  const row = await Tasks.finishTask(db, id, new Date())
  if (!row) return c.notFound()
  return c.redirect(withDate('/', row.scheduledOn), 303)
})

web.post('/tasks/:id{[0-9]+}/reset', async (c) => {
  const db = makeDb(c.env.DB)
  const id = Number(c.req.param('id'))
  const row = await Tasks.resetTask(db, id, new Date())
  if (!row) return c.notFound()
  return c.redirect(withDate('/', row.scheduledOn), 303)
})

web.get('/routines', async (c) => {
  const db = makeDb(c.env.DB)
  const notice = c.req.query('notice') ?? null
  const rows = await Routines.listRoutines(db)
  return c.render('Routines', {
    routines: rows.map(routinePayload),
    sections: SECTIONS,
    flash: { notice },
  })
})

web.post('/routines', zValidator('json', routineSchema), async (c) => {
  const db = makeDb(c.env.DB)
  const { routine_template } = c.req.valid('json')
  if (!routine_template.title) return c.redirect('/routines', 303)
  await Routines.createRoutine(
    db,
    { ...routine_template, title: routine_template.title },
    new Date(),
  )
  return c.redirect('/routines', 303)
})

web.patch('/routines/:id{[0-9]+}', zValidator('json', routineSchema), async (c) => {
  const db = makeDb(c.env.DB)
  const id = Number(c.req.param('id'))
  const { routine_template } = c.req.valid('json')
  const row = await Routines.updateRoutine(db, id, routine_template, new Date())
  if (!row) return c.notFound()
  return c.redirect('/routines', 303)
})

web.delete('/routines/:id{[0-9]+}', async (c) => {
  const db = makeDb(c.env.DB)
  const id = Number(c.req.param('id'))
  await Routines.deleteRoutine(db, id)
  return c.redirect('/routines', 303)
})

web.post('/routines/expand', zValidator('json', expandSchema), async (c) => {
  const db = makeDb(c.env.DB)
  const { date } = c.req.valid('json')
  const target = date ?? todayIso(c.env.DEFAULT_TZ)
  const result = await Routines.expandRoutines(db, target, new Date())
  const notice = `ルーチンを ${result.created_count} 件展開しました`
  return c.redirect(withDate('/', target, { notice }), 303)
})
