import React, { useMemo } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { CalendarDays, ChevronLeft, ChevronRight, Repeat } from 'lucide-react'

import SectionInlineTaskInput from '@/components/SectionInlineTaskInput'
import TaskForm from '@/components/TaskForm'
import TaskRow, { type Task } from '@/components/TaskRow'
import { Button } from '@/components/ui/Button'
import { SECTIONS, formatMinutes, type SectionValue } from '@/lib/format'

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

  const toLocalIsoDate = (d: Date) => {
    const y = d.getFullYear()
    const m = (d.getMonth() + 1).toString().padStart(2, '0')
    const day = d.getDate().toString().padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  const changeDate = (delta: number) => {
    const d = new Date(date + 'T00:00:00')
    d.setDate(d.getDate() + delta)
    router.get('/', { date: toLocalIsoDate(d) }, { preserveScroll: true })
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
    <>
      <Head title={`TaskChute - ${date}`} />

      <header>
        <div>
          <Button size="sm" variant="ghost" onClick={() => changeDate(-1)}>
            <ChevronLeft />
            前日
          </Button>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <Button size="sm" variant="ghost" onClick={() => changeDate(1)}>
            翌日
            <ChevronRight />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDate(toLocalIsoDate(new Date()))}
          >
            <CalendarDays />
            今日
          </Button>
        </div>
        <Button size="sm" variant="secondary" onClick={expandRoutines}>
          <Repeat />
          ルーチンを展開
        </Button>
      </header>

      {flash?.notice && <div role="status">{flash.notice}</div>}

      <TaskForm />

      <aside data-summary>
        <SummaryCard label="タスク" value={`${summary.done_count} / ${summary.total_count}`} />
        <SummaryCard label="見積合計" value={formatMinutes(summary.estimate)} />
        <SummaryCard label="実績合計" value={formatMinutes(summary.actual)} />
        <SummaryCard
          label="差分"
          value={`${diff >= 0 ? '+' : ''}${diff}分`}
          tone={diff > 0 ? 'negative' : 'positive'}
        />
      </aside>

      <div data-sections>
        {SECTIONS.map((s) => (
          <section key={s.value}>
            <header>
              <h2>{s.label}</h2>
              <p>{grouped[s.value as SectionValue].length} 件</p>
            </header>
            <div data-task-list>
              {grouped[s.value as SectionValue].map((t) => (
                <TaskRow key={t.id} task={t} />
              ))}
              <SectionInlineTaskInput date={date} section={s.value as SectionValue} />
            </div>
          </section>
        ))}
      </div>
    </>
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
    <article>
      <p>{label}</p>
      <strong data-tone={tone ?? 'neutral'}>{value}</strong>
    </article>
  )
}
