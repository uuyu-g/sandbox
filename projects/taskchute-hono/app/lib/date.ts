const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export const parseIsoDate = (s: string | null | undefined): string | null => {
  if (!s) return null
  if (!ISO_DATE_RE.test(s)) return null
  const d = new Date(`${s}T00:00:00Z`)
  if (Number.isNaN(d.getTime())) return null
  return s
}

export const todayIso = (tz: string): string => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
  return parts
}

export const weekdayOf = (iso: string): number =>
  new Date(`${iso}T00:00:00Z`).getUTCDay()
