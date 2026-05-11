import React, { useState } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { useStyletron } from 'baseui'
import { HeadingSmall, ParagraphSmall, LabelMedium } from 'baseui/typography'
import { Button, KIND, SIZE, SHAPE } from 'baseui/button'
import { Input } from 'baseui/input'
import { Select } from 'baseui/select'
import { FormControl } from 'baseui/form-control'
import { Checkbox } from 'baseui/checkbox'
import { Tag } from 'baseui/tag'
import { SECTIONS, WEEKDAYS, formatMinutes, sectionLabel } from '../lib/format'

const defaultDraft = () => ({
  title: '',
  section: 'morning',
  estimate_minutes: 15,
  weekdays: [1, 2, 3, 4, 5],
  active: true,
})

export default function Routines({ routines }) {
  const [css, theme] = useStyletron()
  const { flash } = usePage().props
  const [draft, setDraft] = useState(defaultDraft())
  const [editing, setEditing] = useState(null) // id -> draft

  const submitNew = (e) => {
    e.preventDefault()
    if (!draft.title.trim()) return
    router.post(
      '/routines',
      { routine_template: { ...draft, title: draft.title.trim() } },
      {
        preserveScroll: true,
        onSuccess: () => setDraft(defaultDraft()),
      }
    )
  }

  const startEdit = (r) => setEditing({
    id: r.id,
    title: r.title,
    section: r.section,
    estimate_minutes: r.estimate_minutes,
    weekdays: r.weekdays,
    active: r.active,
  })

  const saveEdit = () => {
    router.patch(
      `/routines/${editing.id}`,
      { routine_template: editing },
      { preserveScroll: true, onSuccess: () => setEditing(null) }
    )
  }

  const onDelete = (r) => {
    if (!confirm(`ルーチン「${r.title}」を削除しますか？`)) return
    router.delete(`/routines/${r.id}`, { preserveScroll: true })
  }

  const expandToday = () => {
    router.post('/routines/expand', {}, { preserveScroll: true })
  }

  return (
    <div>
      <Head title="TaskChute - ルーチン" />

      <div
        className={css({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        })}
      >
        <div>
          <HeadingSmall marginTop="0" marginBottom="0">ルーチン</HeadingSmall>
          <ParagraphSmall marginTop="4px" marginBottom="0" color={theme.colors.contentTertiary}>
            毎日繰り返すタスクを登録しておくと、対象曜日に「今日」へワンクリックで展開できます。
          </ParagraphSmall>
        </div>
        <Button size={SIZE.compact} kind={KIND.secondary} onClick={expandToday}>
          ⟲ 今日へ展開
        </Button>
      </div>

      {flash?.notice && (
        <div
          className={css({
            padding: '8px 12px',
            marginBottom: '16px',
            borderRadius: '6px',
            backgroundColor: theme.colors.backgroundAccentLight,
            fontSize: '13px',
          })}
        >
          {flash.notice}
        </div>
      )}

      <form
        onSubmit={submitNew}
        className={css({
          padding: '16px',
          borderRadius: '10px',
          border: `1px solid ${theme.colors.borderOpaque}`,
          marginBottom: '24px',
          display: 'grid',
          gridTemplateColumns: '1fr 140px 120px auto',
          gap: '12px',
          alignItems: 'end',
        })}
      >
        <FormControl label="タイトル">
          <Input
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="朝の散歩"
          />
        </FormControl>
        <FormControl label="セクション">
          <Select
            options={SECTIONS}
            value={SECTIONS.filter((s) => s.value === draft.section)}
            onChange={({ value }) => setDraft({ ...draft, section: value[0]?.value || 'morning' })}
            clearable={false}
            searchable={false}
          />
        </FormControl>
        <FormControl label="見積(分)">
          <Input
            type="number"
            min={0}
            value={String(draft.estimate_minutes)}
            onChange={(e) => setDraft({ ...draft, estimate_minutes: parseInt(e.target.value, 10) || 0 })}
          />
        </FormControl>
        <Button type="submit" disabled={!draft.title.trim()}>追加</Button>
        <div className={css({ gridColumn: '1 / -1' })}>
          <LabelMedium marginTop="0" marginBottom="6px">繰り返す曜日</LabelMedium>
          <WeekdayPicker
            value={draft.weekdays}
            onChange={(weekdays) => setDraft({ ...draft, weekdays })}
          />
        </div>
      </form>

      <div className={css({ display: 'flex', flexDirection: 'column', gap: '8px' })}>
        {routines.length === 0 && (
          <div
            className={css({
              padding: '24px',
              textAlign: 'center',
              color: theme.colors.contentTertiary,
              border: `1px dashed ${theme.colors.borderOpaque}`,
              borderRadius: '10px',
            })}
          >
            ルーチンはまだありません。上のフォームから追加できます。
          </div>
        )}
        {routines.map((r) =>
          editing?.id === r.id ? (
            <div
              key={r.id}
              className={css({
                padding: '14px',
                borderRadius: '10px',
                border: `1px solid ${theme.colors.borderAccent}`,
                display: 'grid',
                gridTemplateColumns: '1fr 140px 120px auto auto',
                gap: '10px',
                alignItems: 'end',
              })}
            >
              <FormControl label="タイトル">
                <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </FormControl>
              <FormControl label="セクション">
                <Select
                  options={SECTIONS}
                  value={SECTIONS.filter((s) => s.value === editing.section)}
                  onChange={({ value }) => setEditing({ ...editing, section: value[0]?.value || 'morning' })}
                  clearable={false}
                  searchable={false}
                />
              </FormControl>
              <FormControl label="見積(分)">
                <Input
                  type="number"
                  min={0}
                  value={String(editing.estimate_minutes)}
                  onChange={(e) => setEditing({ ...editing, estimate_minutes: parseInt(e.target.value, 10) || 0 })}
                />
              </FormControl>
              <Button onClick={saveEdit} kind={KIND.primary}>保存</Button>
              <Button onClick={() => setEditing(null)} kind={KIND.tertiary}>×</Button>
              <div className={css({ gridColumn: '1 / -1' })}>
                <WeekdayPicker
                  value={editing.weekdays}
                  onChange={(weekdays) => setEditing({ ...editing, weekdays })}
                />
              </div>
              <div className={css({ gridColumn: '1 / -1' })}>
                <Checkbox
                  checked={editing.active}
                  onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                >
                  有効
                </Checkbox>
              </div>
            </div>
          ) : (
            <RoutineRow key={r.id} routine={r} onEdit={() => startEdit(r)} onDelete={() => onDelete(r)} />
          )
        )}
      </div>
    </div>
  )
}

function RoutineRow({ routine, onEdit, onDelete }) {
  const [css, theme] = useStyletron()
  return (
    <div
      className={css({
        display: 'grid',
        gridTemplateColumns: '110px 1fr 100px 220px 180px',
        gap: '12px',
        alignItems: 'center',
        padding: '12px',
        borderRadius: '10px',
        border: `1px solid ${theme.colors.borderOpaque}`,
        opacity: routine.active ? 1 : 0.5,
      })}
    >
      <Tag closeable={false} kind="neutral">{sectionLabel(routine.section)}</Tag>
      <div className={css({ fontWeight: 600 })}>{routine.title}</div>
      <div className={css({ fontSize: '13px', color: theme.colors.contentTertiary })}>
        {formatMinutes(routine.estimate_minutes)}
      </div>
      <div className={css({ display: 'flex', gap: '4px', flexWrap: 'wrap' })}>
        {WEEKDAYS.map((w) => (
          <span
            key={w.value}
            className={css({
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              fontSize: '11px',
              fontWeight: 600,
              backgroundColor: routine.weekdays.includes(w.value)
                ? theme.colors.backgroundAccent
                : theme.colors.backgroundSecondary,
              color: routine.weekdays.includes(w.value)
                ? theme.colors.contentInversePrimary
                : theme.colors.contentTertiary,
            })}
          >
            {w.label}
          </span>
        ))}
      </div>
      <div className={css({ display: 'flex', gap: '6px', justifyContent: 'flex-end' })}>
        <Button size={SIZE.mini} kind={KIND.secondary} onClick={onEdit}>編集</Button>
        <Button size={SIZE.mini} kind={KIND.tertiary} shape={SHAPE.square} onClick={onDelete}>×</Button>
      </div>
    </div>
  )
}

function WeekdayPicker({ value, onChange }) {
  const [css, theme] = useStyletron()
  const toggle = (w) => {
    if (value.includes(w)) onChange(value.filter((x) => x !== w))
    else onChange([...value, w].sort((a, b) => a - b))
  }
  return (
    <div className={css({ display: 'flex', gap: '6px' })}>
      {WEEKDAYS.map((w) => {
        const on = value.includes(w.value)
        return (
          <button
            key={w.value}
            type="button"
            onClick={() => toggle(w.value)}
            className={css({
              cursor: 'pointer',
              border: `1px solid ${on ? theme.colors.borderAccent : theme.colors.borderOpaque}`,
              backgroundColor: on ? theme.colors.backgroundAccent : 'transparent',
              color: on ? theme.colors.contentInversePrimary : theme.colors.contentPrimary,
              fontWeight: 600,
              fontSize: '13px',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
            })}
          >
            {w.label}
          </button>
        )
      })}
    </div>
  )
}
