import { inertia } from '@hono/inertia'
import { Hono } from 'hono'

import type { AppEnv } from './env'
import { rootView } from './root-view'
import { api } from './routes/api'
import { web } from './routes/web'

const app = new Hono<AppEnv>()

app.use(inertia({ rootView }))

app.route('/', web)
app.route('/api/v1', api)

export default app
