import React, { useState } from 'react'
import { router } from '@inertiajs/react'
import { Repeat, RotateCcw, X } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { onEnterKey } from '@/lib/utils'
import { formatMinutes, formatTime } from '@/lib/format'

export interface Task {
  id: number
  title: string
  section: string
  estimate_minutes: number
  actual_minutes: number | null
  started_at: string | null
  finished_at: string | null
  done: boolean
  in_progress: boolean
  routine_template_id: number | null
}

export default function TaskRow({ task }: { task: Task }) {
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
      {
        task: {
          title: title.trim() || task.title,
          estimate_minutes: parseInt(estimate, 10) || 0,
        },
      },
      { ...opts, onFinish: () => setEditing(false) },
    )
  }

  const statusBadge = task.done ? (
    <Badge variant="success">完了</Badge>
  ) : task.in_progress ? (
    <Badge variant="accent">進行中</Badge>
  ) : (
    <Badge variant="outline">未着手</Badge>
  )

  const status = task.done ? 'done' : task.in_progress ? 'in-progress' : 'idle'

  const actual = task.actual_minutes
  const delta = actual != null ? actual - task.estimate_minutes : null
  const actualTone =
    delta == null ? 'neutral' : delta > 0 ? 'over' : delta < 0 ? 'under' : 'neutral'

  return (
    <article className="task-row" data-status={status}>
      <div className="status">
        {statusBadge}
        <time>
          {formatTime(task.started_at)} → {formatTime(task.finished_at)}
        </time>
      </div>

      <div className="title">
        {editing ? (
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={onEnterKey(() => saveEdit())}
            autoFocus
          />
        ) : (
          <button type="button" onClick={() => setEditing(true)} title="クリックで編集">
            {task.title}
          </button>
        )}
        {task.routine_template_id && (
          <small>
            <Repeat />
            ルーチン
          </small>
        )}
      </div>

      <div className="estimate">
        {editing ? (
          <span className="input-wrap">
            <input
              type="number"
              min={0}
              value={estimate}
              onChange={(e) => setEstimate(e.target.value)}
            />
            <span className="unit">分</span>
          </span>
        ) : (
          <span>見積 {formatMinutes(task.estimate_minutes)}</span>
        )}
      </div>

      <div className="actual" data-tone={actualTone}>
        実績{' '}
        {actual == null
          ? '-'
          : `${formatMinutes(actual)}${
              delta != null && delta !== 0 ? ` (${delta > 0 ? '+' : ''}${delta}分)` : ''
            }`}
      </div>

      <footer>
        {editing ? (
          <>
            <Button size="sm" onClick={saveEdit}>
              保存
            </Button>
            <Button size="icon-sm" variant="ghost" onClick={() => setEditing(false)}>
              <X />
            </Button>
          </>
        ) : (
          <>
            {!task.in_progress && !task.done && (
              <Button size="sm" onClick={onStart}>
                開始
              </Button>
            )}
            {task.in_progress && (
              <Button size="sm" onClick={onFinish}>
                終了
              </Button>
            )}
            {(task.in_progress || task.done) && (
              <Button size="sm" variant="ghost" onClick={onReset}>
                <RotateCcw />
                戻す
              </Button>
            )}
            <Button size="icon-sm" variant="ghost" onClick={onDelete} title="削除">
              <X />
            </Button>
          </>
        )}
      </footer>
    </article>
  )
}
