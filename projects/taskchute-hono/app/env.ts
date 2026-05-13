export type Bindings = {
  DB: D1Database
  DEFAULT_TZ: string
}

export type AppEnv = {
  Bindings: Bindings
  Variables: Record<string, never>
}
