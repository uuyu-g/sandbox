import React, { useState } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { Repeat, X } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cx } from '@/lib/utils'
import {
  SECTIONS,
  WEEKDAYS,
  formatMinutes,
  sectionLabel,
  type SectionValue,
} from '@/lib/format'
import styles from './Routines.module.css'

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

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>ルーチン</h1>
          <p className={styles.description}>
            毎日繰り返すタスクを登録しておくと、対象曜日に「今日」へワンクリックで展開できます。
          </p>
        </div>
        <Button size="sm" variant="secondary" onClick={expandToday}>
          <Repeat />
          今日へ展開
        </Button>
      </div>

      {flash?.notice && <div className={styles.notice}>{flash.notice}</div>}

      <form onSubmit={submitNew} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="routine-title">タイトル</label>
          <input
            id="routine-title"
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="朝の散歩"
          />
        </div>
        <div className={styles.field}>
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
        </div>
        <div className={styles.field}>
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
        </div>
        <Button type="submit" disabled={!draft.title.trim()}>
          追加
        </Button>
        <div className={styles.fullRow}>
          <label className={styles.weekdaysLabel}>繰り返す曜日</label>
          <WeekdayPicker
            value={draft.weekdays}
            onChange={(weekdays) => setDraft({ ...draft, weekdays })}
          />
        </div>
      </form>

      <div className={styles.list}>
        {routines.length === 0 && (
          <div className={styles.empty}>
            ルーチンはまだありません。上のフォームから追加できます。
          </div>
        )}
        {routines.map((r) =>
          editing?.id === r.id ? (
            <div key={r.id} className={cx(styles.row, styles.editing)}>
              <div className={styles.field}>
                <label>タイトル</label>
                <input
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
              </div>
              <div className={styles.field}>
                <label>セクション</label>
                <select
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
              </div>
              <div className={styles.field}>
                <label>見積(分)</label>
                <input
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
              <div className={styles.fullRow}>
                <label className={styles.weekdaysLabel}>繰り返す曜日</label>
                <WeekdayPicker
                  value={editing.weekdays}
                  onChange={(weekdays) => setEditing({ ...editing, weekdays })}
                />
              </div>
              <div className={cx(styles.fullRow, styles.activeRow)}>
                <input
                  id={`active-${editing.id}`}
                  type="checkbox"
                  checked={editing.active}
                  onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                />
                <label htmlFor={`active-${editing.id}`} className={styles.activeLabel}>
                  有効
                </label>
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
    <div className={cx(styles.row, !routine.active && styles.rowInactive)}>
      <Badge variant="muted">{sectionLabel(routine.section)}</Badge>
      <div className={styles.rowTitle}>{routine.title}</div>
      <div className={styles.rowEstimate}>{formatMinutes(routine.estimate_minutes)}</div>
      <div className={styles.weekdayChips}>
        {WEEKDAYS.map((w) => {
          const on = routine.weekdays.includes(w.value)
          return (
            <span
              key={w.value}
              className={cx(styles.weekdayChip, on && styles.weekdayChipOn)}
            >
              {w.label}
            </span>
          )
        })}
      </div>
      <div className={styles.rowActions}>
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
    <div className={styles.weekdayPicker}>
      {WEEKDAYS.map((w) => {
        const on = value.includes(w.value)
        return (
          <button
            key={w.value}
            type="button"
            onClick={() => toggle(w.value)}
            className={cx(styles.weekdayButton, on && styles.weekdayButtonOn)}
          >
            {w.label}
          </button>
        )
      })}
    </div>
  )
}
