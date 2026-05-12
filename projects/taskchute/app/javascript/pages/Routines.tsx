import React, { useState } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { Repeat, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  SECTIONS,
  WEEKDAYS,
  formatMinutes,
  sectionLabel,
  type SectionValue,
} from '@/lib/format'

interface Routine {
  id: number
  title: string
  section: SectionValue
  estimate_minutes: number
  weekdays: number[]
  active: boolean
}

interface Draft {
  title: string
  section: SectionValue
  estimate_minutes: number
  weekdays: number[]
  active: boolean
}

interface EditingDraft extends Draft {
  id: number
}

const defaultDraft = (): Draft => ({
  title: '',
  section: 'morning',
  estimate_minutes: 15,
  weekdays: [1, 2, 3, 4, 5],
  active: true,
})

interface RoutinesProps {
  routines: Routine[]
}

type FlashProps = {
  flash?: { notice?: string | null }
  [key: string]: unknown
}

export default function Routines({ routines }: RoutinesProps) {
  const { flash } = usePage<FlashProps>().props
  const [draft, setDraft] = useState<Draft>(defaultDraft())
  const [editing, setEditing] = useState<EditingDraft | null>(null)

  const submitNew = (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.title.trim()) return
    router.post(
      '/routines',
      { routine_template: { ...draft, title: draft.title.trim() } },
      {
        preserveScroll: true,
        onSuccess: () => setDraft(defaultDraft()),
      },
    )
  }

  const startEdit = (r: Routine) =>
    setEditing({
      id: r.id,
      title: r.title,
      section: r.section,
      estimate_minutes: r.estimate_minutes,
      weekdays: r.weekdays,
      active: r.active,
    })

  const saveEdit = () => {
    if (!editing) return
    const { id: _id, ...payload } = editing
    router.patch(
      `/routines/${editing.id}`,
      { routine_template: payload },
      { preserveScroll: true, onSuccess: () => setEditing(null) },
    )
  }

  const onDelete = (r: Routine) => {
    if (!confirm(`ルーチン「${r.title}」を削除しますか？`)) return
    router.delete(`/routines/${r.id}`, { preserveScroll: true })
  }

  const expandToday = () => {
    router.post('/routines/expand', {}, { preserveScroll: true })
  }

  return (
    <div>
      <Head title="TaskChute - ルーチン" />

      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold">ルーチン</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            毎日繰り返すタスクを登録しておくと、対象曜日に「今日」へワンクリックで展開できます。
          </p>
        </div>
        <Button size="sm" variant="secondary" onClick={expandToday}>
          <Repeat />
          今日へ展開
        </Button>
      </div>

      {flash?.notice && (
        <div className="mb-4 rounded-md bg-sky-50 px-3 py-2 text-sm text-sky-900">
          {flash.notice}
        </div>
      )}

      <form
        onSubmit={submitNew}
        className="mb-6 grid items-end gap-3 rounded-lg border border-border p-4 sm:grid-cols-[minmax(0,1fr)_140px_120px_auto]"
      >
        <div className="grid gap-1.5">
          <Label htmlFor="routine-title">タイトル</Label>
          <Input
            id="routine-title"
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="朝の散歩"
          />
        </div>
        <div className="grid gap-1.5">
          <Label>セクション</Label>
          <Select
            value={draft.section}
            onValueChange={(v) => setDraft({ ...draft, section: v as SectionValue })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SECTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="routine-estimate">見積(分)</Label>
          <Input
            id="routine-estimate"
            type="number"
            min={0}
            value={String(draft.estimate_minutes)}
            onChange={(e) =>
              setDraft({ ...draft, estimate_minutes: parseInt(e.target.value, 10) || 0 })
            }
          />
        </div>
        <Button type="submit" disabled={!draft.title.trim()}>
          追加
        </Button>
        <div className="sm:col-span-full">
          <Label className="mb-2 block">繰り返す曜日</Label>
          <WeekdayPicker
            value={draft.weekdays}
            onChange={(weekdays) => setDraft({ ...draft, weekdays })}
          />
        </div>
      </form>

      <div className="flex flex-col gap-2">
        {routines.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            ルーチンはまだありません。上のフォームから追加できます。
          </div>
        )}
        {routines.map((r) =>
          editing?.id === r.id ? (
            <div
              key={r.id}
              className="grid items-end gap-3 rounded-lg border-2 border-primary/40 p-4 sm:grid-cols-[minmax(0,1fr)_140px_120px_auto_auto]"
            >
              <div className="grid gap-1.5">
                <Label>タイトル</Label>
                <Input
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>セクション</Label>
                <Select
                  value={editing.section}
                  onValueChange={(v) =>
                    setEditing({ ...editing, section: v as SectionValue })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>見積(分)</Label>
                <Input
                  type="number"
                  min={0}
                  value={String(editing.estimate_minutes)}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      estimate_minutes: parseInt(e.target.value, 10) || 0,
                    })
                  }
                />
              </div>
              <Button onClick={saveEdit}>保存</Button>
              <Button size="icon" variant="ghost" onClick={() => setEditing(null)}>
                <X />
              </Button>
              <div className="sm:col-span-full">
                <Label className="mb-2 block">繰り返す曜日</Label>
                <WeekdayPicker
                  value={editing.weekdays}
                  onChange={(weekdays) => setEditing({ ...editing, weekdays })}
                />
              </div>
              <div className="flex items-center gap-2 sm:col-span-full">
                <Checkbox
                  id={`active-${editing.id}`}
                  checked={editing.active}
                  onCheckedChange={(checked) =>
                    setEditing({ ...editing, active: checked === true })
                  }
                />
                <Label htmlFor={`active-${editing.id}`}>有効</Label>
              </div>
            </div>
          ) : (
            <RoutineRow
              key={r.id}
              routine={r}
              onEdit={() => startEdit(r)}
              onDelete={() => onDelete(r)}
            />
          ),
        )}
      </div>
    </div>
  )
}

function RoutineRow({
  routine,
  onEdit,
  onDelete,
}: {
  routine: Routine
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div
      className={cn(
        'grid items-center gap-3 rounded-lg border border-border bg-card p-3',
        'sm:grid-cols-[100px_minmax(0,1fr)_100px_minmax(220px,auto)_minmax(160px,auto)]',
        !routine.active && 'opacity-50',
      )}
    >
      <Badge variant="muted">{sectionLabel(routine.section)}</Badge>
      <div className="font-semibold">{routine.title}</div>
      <div className="text-sm text-muted-foreground">
        {formatMinutes(routine.estimate_minutes)}
      </div>
      <div className="flex flex-wrap gap-1">
        {WEEKDAYS.map((w) => {
          const on = routine.weekdays.includes(w.value)
          return (
            <span
              key={w.value}
              className={cn(
                'inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold',
                on
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {w.label}
            </span>
          )
        })}
      </div>
      <div className="flex justify-end gap-1.5">
        <Button size="sm" variant="outline" onClick={onEdit}>
          編集
        </Button>
        <Button size="icon-sm" variant="ghost" onClick={onDelete}>
          <X />
        </Button>
      </div>
    </div>
  )
}

function WeekdayPicker({
  value,
  onChange,
}: {
  value: number[]
  onChange: (value: number[]) => void
}) {
  const toggle = (w: number) => {
    if (value.includes(w)) onChange(value.filter((x) => x !== w))
    else onChange([...value, w].sort((a, b) => a - b))
  }
  return (
    <div className="flex gap-1.5">
      {WEEKDAYS.map((w) => {
        const on = value.includes(w.value)
        return (
          <button
            key={w.value}
            type="button"
            onClick={() => toggle(w.value)}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition-colors',
              on
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-transparent text-foreground hover:bg-secondary',
            )}
          >
            {w.label}
          </button>
        )
      })}
    </div>
  )
}
