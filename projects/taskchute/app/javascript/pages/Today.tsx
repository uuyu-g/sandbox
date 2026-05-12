import React, { useMemo } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { ChevronLeft, ChevronRight, CalendarDays, Repeat } from 'lucide-react'

import TaskForm from '@/components/TaskForm'
import TaskRow, { type Task } from '@/components/TaskRow'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { SECTIONS, formatMinutes, sectionLabel, type SectionValue } from '@/lib/format'

interface Summary {
  done_count: number
  total_count: number
  estimate: number
  actual: number
}

interface TodayProps {
  date: string
  tasks: Task[]
  summary: Summary
}

type FlashProps = {
  flash?: { notice?: string | null }
  [key: string]: unknown
}

export default function Today({ date, tasks, summary }: TodayProps) {
  const { flash } = usePage<FlashProps>().props

  const grouped = useMemo(() => {
    const map: Record<string, Task[]> = Object.fromEntries(SECTIONS.map((s) => [s.value, []]))
    for (const t of tasks) {
      ;(map[t.section] || (map[t.section] = [])).push(t)
    }
    return map
  }, [tasks])

  const changeDate = (delta: number) => {
    const d = new Date(date + 'T00:00:00')
    d.setDate(d.getDate() + delta)
    router.get('/', { date: d.toISOString().slice(0, 10) }, { preserveScroll: true })
  }

  const setDate = (iso: string) => {
    if (!iso) return
    router.get('/', { date: iso }, { preserveScroll: true })
  }

  const expandRoutines = () => {
    router.post('/routines/expand', { date }, { preserveScroll: true })
  }

  const diff = summary.actual - summary.estimate

  return (
    <div>
      <Head title={`TaskChute - ${date}`} />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => changeDate(-1)}>
            <ChevronLeft />
            前日
          </Button>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-8 w-44 text-sm"
          />
          <Button size="sm" variant="ghost" onClick={() => changeDate(1)}>
            翌日
            <ChevronRight />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDate(new Date().toISOString().slice(0, 10))}
          >
            <CalendarDays />
            今日
          </Button>
        </div>
        <Button size="sm" variant="secondary" onClick={expandRoutines}>
          <Repeat />
          ルーチンを展開
        </Button>
      </div>

      {flash?.notice && (
        <div className="mb-4 rounded-md bg-sky-50 px-3 py-2 text-sm text-sky-900">
          {flash.notice}
        </div>
      )}

      <TaskForm date={date} />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="タスク" value={`${summary.done_count} / ${summary.total_count}`} />
        <SummaryCard label="見積合計" value={formatMinutes(summary.estimate)} />
        <SummaryCard label="実績合計" value={formatMinutes(summary.actual)} />
        <SummaryCard
          label="差分"
          value={`${diff >= 0 ? '+' : ''}${diff}分`}
          tone={diff > 0 ? 'negative' : 'positive'}
        />
      </div>

      <div className="flex flex-col gap-6">
        {SECTIONS.map((s) => (
          <section key={s.value}>
            <div className="mb-2 flex items-baseline gap-3">
              <h2 className="text-lg font-bold">{s.label}</h2>
              <p className="text-xs text-muted-foreground">
                {grouped[s.value as SectionValue].length} 件
              </p>
            </div>
            {grouped[s.value as SectionValue].length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                {sectionLabel(s.value)} のタスクはまだありません
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {grouped[s.value as SectionValue].map((t) => (
                  <TaskRow key={t.id} task={t} />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: 'positive' | 'negative'
}) {
  return (
    <Card>
      <CardContent className="p-4 pt-4">
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
        <div
          className={cn(
            'mt-1 text-2xl font-bold',
            tone === 'positive' && 'text-emerald-600',
            tone === 'negative' && 'text-rose-600',
          )}
        >
          {value}
        </div>
      </CardContent>
    </Card>
  )
}
