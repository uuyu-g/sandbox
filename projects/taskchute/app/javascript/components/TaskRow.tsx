import React, { useState } from 'react'
import { router } from '@inertiajs/react'
import { RotateCcw, X, Repeat } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
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

  const actual = task.actual_minutes
  const delta = actual != null ? actual - task.estimate_minutes : null

  return (
    <div
      className={cn(
        'grid items-center gap-3 rounded-lg border p-3 transition-colors',
        'sm:grid-cols-[120px_minmax(0,1fr)_110px_120px_minmax(220px,auto)]',
        task.done
          ? 'border-border bg-muted/60 opacity-70'
          : task.in_progress
            ? 'border-sky-200 bg-sky-50/60'
            : 'border-border bg-card',
      )}
    >
      <div className="flex flex-col gap-1">
        {statusBadge}
        <div className="text-xs text-muted-foreground">
          {formatTime(task.started_at)} → {formatTime(task.finished_at)}
        </div>
      </div>

      <div className="min-w-0">
        {editing ? (
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
            autoFocus
            className="h-8 text-sm"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            title="クリックで編集"
            className={cn(
              'block w-full truncate text-left font-semibold hover:underline',
              task.done && 'line-through',
            )}
          >
            {task.title}
          </button>
        )}
        {task.routine_template_id && (
          <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
            <Repeat className="h-3 w-3" />
            ルーチン
          </div>
        )}
      </div>

      <div className="text-sm">
        {editing ? (
          <div className="relative">
            <Input
              type="number"
              min={0}
              value={estimate}
              onChange={(e) => setEstimate(e.target.value)}
              className="h-8 pr-8 text-sm"
            />
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              分
            </span>
          </div>
        ) : (
          <span>見積 {formatMinutes(task.estimate_minutes)}</span>
        )}
      </div>

      <div
        className={cn(
          'text-sm',
          delta == null
            ? 'text-muted-foreground'
            : delta > 0
              ? 'text-rose-600'
              : 'text-emerald-600',
        )}
      >
        実績{' '}
        {actual == null
          ? '-'
          : `${formatMinutes(actual)}${
              delta != null && delta !== 0 ? ` (${delta > 0 ? '+' : ''}${delta}分)` : ''
            }`}
      </div>

      <div className="flex flex-wrap justify-end gap-1.5">
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
      </div>
    </div>
  )
}
