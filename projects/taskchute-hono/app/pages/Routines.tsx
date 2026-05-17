import React, { useState } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { Repeat, X } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
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
    <>
      <Head title="TaskChute - ルーチン" />

      <header data-stack="true">
        <hgroup>
          <h2>ルーチン</h2>
          <p>
            毎日繰り返すタスクを登録しておくと、対象曜日に「今日」へワンクリックで展開できます。
          </p>
        </hgroup>
        <Button size="sm" variant="secondary" onClick={expandToday}>
          <Repeat />
          今日へ展開
        </Button>
      </header>

      {flash?.notice && <div role="status">{flash.notice}</div>}

      <form data-routine-form onSubmit={submitNew}>
        <p>
          <label htmlFor="routine-title">タイトル</label>
          <input
            id="routine-title"
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="朝の散歩"
          />
        </p>
        <p>
          <label htmlFor="routine-section">セクション</label>
          <select
            id="routine-section"
            value={draft.section}
            onChange={(e) => setDraft({ ...draft, section: e.target.value as SectionValue })}
          >
            {SECTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </p>
        <p>
          <label htmlFor="routine-estimate">見積(分)</label>
          <input
            id="routine-estimate"
            type="number"
            min={0}
            value={String(draft.estimate_minutes)}
            onChange={(e) =>
              setDraft({ ...draft, estimate_minutes: parseInt(e.target.value, 10) || 0 })
            }
          />
        </p>
        <Button type="submit" disabled={!draft.title.trim()}>
          追加
        </Button>
        <div data-full="true">
          <label>繰り返す曜日</label>
          <WeekdayPicker
            value={draft.weekdays}
            onChange={(weekdays) => setDraft({ ...draft, weekdays })}
          />
        </div>
      </form>

      <div data-routine-list>
        {routines.length === 0 && (
          <p data-empty>ルーチンはまだありません。上のフォームから追加できます。</p>
        )}
        {routines.map((r) =>
          editing?.id === r.id ? (
            <article key={r.id} data-routine-row data-editing="true">
              <p>
                <label htmlFor={`edit-title-${editing.id}`}>タイトル</label>
                <input
                  id={`edit-title-${editing.id}`}
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
              </p>
              <p>
                <label htmlFor={`edit-section-${editing.id}`}>セクション</label>
                <select
                  id={`edit-section-${editing.id}`}
                  value={editing.section}
                  onChange={(e) =>
                    setEditing({ ...editing, section: e.target.value as SectionValue })
                  }
                >
                  {SECTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </p>
              <p>
                <label htmlFor={`edit-estimate-${editing.id}`}>見積(分)</label>
                <input
                  id={`edit-estimate-${editing.id}`}
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
              </p>
              <Button onClick={saveEdit}>保存</Button>
              <Button size="icon" variant="ghost" onClick={() => setEditing(null)}>
                <X />
              </Button>
              <div data-full="true">
                <label data-weekdays-label>繰り返す曜日</label>
                <WeekdayPicker
                  value={editing.weekdays}
                  onChange={(weekdays) => setEditing({ ...editing, weekdays })}
                />
              </div>
              <div data-active-row>
                <input
                  id={`active-${editing.id}`}
                  type="checkbox"
                  checked={editing.active}
                  onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                />
                <label htmlFor={`active-${editing.id}`}>有効</label>
              </div>
            </article>
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
    </>
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
    <article data-routine-row data-active={routine.active ? 'true' : 'false'}>
      <Badge variant="muted">{sectionLabel(routine.section)}</Badge>
      <div data-title>{routine.title}</div>
      <div data-estimate>{formatMinutes(routine.estimate_minutes)}</div>
      <div data-weekday-chips>
        {WEEKDAYS.map((w) => {
          const on = routine.weekdays.includes(w.value)
          return (
            <span key={w.value} data-on={on ? 'true' : 'false'}>
              {w.label}
            </span>
          )
        })}
      </div>
      <footer>
        <Button size="sm" variant="outline" onClick={onEdit}>
          編集
        </Button>
        <Button size="icon-sm" variant="ghost" onClick={onDelete}>
          <X />
        </Button>
      </footer>
    </article>
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
    <div data-weekday-picker>
      {WEEKDAYS.map((w) => {
        const on = value.includes(w.value)
        return (
          <button
            key={w.value}
            type="button"
            data-on={on ? 'true' : 'false'}
            onClick={() => toggle(w.value)}
          >
            {w.label}
          </button>
        )
      })}
    </div>
  )
}
