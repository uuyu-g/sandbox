import React, { useState } from 'react'
import { router } from '@inertiajs/react'
import { Button, KIND, SIZE, SHAPE } from 'baseui/button'
import { Input } from 'baseui/input'
import { Tag, VARIANT } from 'baseui/tag'
import { useStyletron } from 'baseui'
import { formatMinutes, formatTime } from '../lib/format'

export default function TaskRow({ task }) {
  const [css, theme] = useStyletron()
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [estimate, setEstimate] = useState(String(task.estimate_minutes))

  const opts = { preserveScroll: true }

  const onStart = () => router.post(`/tasks/${task.id}/start`, {}, opts)
  const onFinish = () => router.post(`/tasks/${task.id}/finish`, {}, opts)
  const onReset = () => router.post(`/tasks/${task.id}/reset`, {}, opts)
  const onDelete = () => {
    if (!confirm(`「${task.title}」を削除しますか？`)) return
    router.delete(`/tasks/${task.id}`, opts)
  }
  const saveEdit = () => {
    router.patch(
      `/tasks/${task.id}`,
      { task: { title: title.trim() || task.title, estimate_minutes: parseInt(estimate, 10) || 0 } },
      { ...opts, onFinish: () => setEditing(false) }
    )
  }

  const status = task.done
    ? { label: '完了', kind: VARIANT.solid, color: 'positive' }
    : task.in_progress
    ? { label: '進行中', kind: VARIANT.solid, color: 'accent' }
    : { label: '未着手', kind: VARIANT.outlined, color: 'neutral' }

  const actual = task.actual_minutes
  const delta = actual != null ? actual - task.estimate_minutes : null

  return (
    <div
      className={css({
        display: 'grid',
        gridTemplateColumns: '120px 1fr 110px 110px 220px',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 12px',
        borderRadius: '10px',
        backgroundColor: task.done
          ? theme.colors.backgroundSecondary
          : task.in_progress
          ? theme.colors.backgroundAccentLight
          : theme.colors.backgroundPrimary,
        border: `1px solid ${theme.colors.borderOpaque}`,
        opacity: task.done ? 0.7 : 1,
      })}
    >
      <div className={css({ display: 'flex', flexDirection: 'column', gap: '4px' })}>
        <Tag closeable={false} variant={status.kind} kind={status.color}>
          {status.label}
        </Tag>
        <div className={css({ fontSize: '12px', color: theme.colors.contentTertiary })}>
          {formatTime(task.started_at)} → {formatTime(task.finished_at)}
        </div>
      </div>

      <div className={css({ minWidth: 0 })}>
        {editing ? (
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
            autoFocus
            size={SIZE.compact}
          />
        ) : (
          <div
            className={css({
              fontWeight: 600,
              textDecoration: task.done ? 'line-through' : 'none',
              cursor: 'pointer',
            })}
            onClick={() => setEditing(true)}
            title="クリックで編集"
          >
            {task.title}
          </div>
        )}
        {task.routine_template_id && (
          <div className={css({ fontSize: '11px', color: theme.colors.contentTertiary, marginTop: '2px' })}>
            ⟲ ルーチン
          </div>
        )}
      </div>

      <div className={css({ fontSize: '13px' })}>
        {editing ? (
          <Input
            type="number"
            min={0}
            value={estimate}
            onChange={(e) => setEstimate(e.target.value)}
            size={SIZE.compact}
            endEnhancer="分"
          />
        ) : (
          <span>見積 {formatMinutes(task.estimate_minutes)}</span>
        )}
      </div>

      <div
        className={css({
          fontSize: '13px',
          color: delta == null ? theme.colors.contentTertiary : delta > 0 ? theme.colors.negative : theme.colors.positive,
        })}
      >
        実績 {actual == null ? '-' : `${formatMinutes(actual)}${delta != null && delta !== 0 ? ` (${delta > 0 ? '+' : ''}${delta}分)` : ''}`}
      </div>

      <div className={css({ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' })}>
        {editing ? (
          <>
            <Button size={SIZE.mini} kind={KIND.primary} onClick={saveEdit}>保存</Button>
            <Button size={SIZE.mini} kind={KIND.tertiary} onClick={() => setEditing(false)}>×</Button>
          </>
        ) : (
          <>
            {!task.in_progress && !task.done && (
              <Button size={SIZE.mini} kind={KIND.primary} onClick={onStart}>開始</Button>
            )}
            {task.in_progress && (
              <Button size={SIZE.mini} kind={KIND.primary} onClick={onFinish}>終了</Button>
            )}
            {(task.in_progress || task.done) && (
              <Button size={SIZE.mini} kind={KIND.tertiary} onClick={onReset}>戻す</Button>
            )}
            <Button size={SIZE.mini} kind={KIND.tertiary} shape={SHAPE.square} onClick={onDelete} title="削除">
              ×
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
