import { Hono } from 'hono'
import type { Context } from 'hono'
import type { AppEnv } from '@/env'

// JSON API skeleton for future iOS / external clients.
// Services in app/services/* are reused here when implemented.
// Each route currently returns 501; flesh out as needed.

export const api = new Hono<AppEnv>()

const notImplemented = (c: Context<AppEnv>) =>
  c.json(
    { error: { code: 'not_implemented', message: 'JSON API is not implemented yet.' } },
    501,
  )

api.all('/days/:date', notImplemented)
api.all('/tasks', notImplemented)
api.all('/tasks/reorder', notImplemented)
api.all('/tasks/:id', notImplemented)
api.all('/tasks/:id/start', notImplemented)
api.all('/tasks/:id/finish', notImplemented)
api.all('/tasks/:id/reset', notImplemented)
api.all('/routines', notImplemented)
api.all('/routines/expand', notImplemented)
api.all('/routines/:id', notImplemented)
