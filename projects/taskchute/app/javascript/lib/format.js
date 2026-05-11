export function formatMinutes(min) {
  if (min == null) return '-'
  const m = Math.max(0, Math.round(Number(min)))
  const h = Math.floor(m / 60)
  const rest = m % 60
  if (h === 0) return `${rest}分`
  return `${h}時間${rest.toString().padStart(2, '0')}分`
}

export function formatTime(iso) {
  if (!iso) return '--:--'
  const d = new Date(iso)
  const hh = d.getHours().toString().padStart(2, '0')
  const mm = d.getMinutes().toString().padStart(2, '0')
  return `${hh}:${mm}`
}

export function diffMinutes(startIso, endIso) {
  if (!startIso || !endIso) return null
  const s = new Date(startIso).getTime()
  const e = new Date(endIso).getTime()
  return Math.max(0, Math.round((e - s) / 60000))
}

export const SECTIONS = [
  { value: 'morning', label: '朝' },
  { value: 'noon', label: '昼' },
  { value: 'night', label: '夜' },
]

export function sectionLabel(value) {
  return SECTIONS.find((s) => s.value === value)?.label || value
}

export const WEEKDAYS = [
  { value: 0, label: '日' },
  { value: 1, label: '月' },
  { value: 2, label: '火' },
  { value: 3, label: '水' },
  { value: 4, label: '木' },
  { value: 5, label: '金' },
  { value: 6, label: '土' },
]
