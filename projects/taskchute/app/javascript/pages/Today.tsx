import React, { useMemo } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { CalendarDays, ChevronLeft, ChevronRight, Repeat } from 'lucide-react'

import SectionInlineTaskInput from '@/components/SectionInlineTaskInput'
import TaskForm from '@/components/TaskForm'
import TaskRow, { type Task } from '@/components/TaskRow'
import { Button } from '@/components/ui/Button'
import { cx } from '@/lib/utils'
import { SECTIONS, formatMinutes, type SectionValue } from '@/lib/format'
import styles from './Today.module.css'

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
    <div>
      <Head title={`TaskChute - ${date}`} />

      <div className={styles.toolbar}>
        <div className={styles.dateNav}>
          <Button size="sm" variant="ghost" onClick={() => changeDate(-1)}>
            <ChevronLeft />
            前日
          </Button>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={styles.dateInput}
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
      </div>

      {flash?.notice && <div className={styles.notice}>{flash.notice}</div>}

      <TaskForm />

      <div className={styles.summaryGrid}>
        <SummaryCard label="タスク" value={`${summary.done_count} / ${summary.total_count}`} />
        <SummaryCard label="見積合計" value={formatMinutes(summary.estimate)} />
        <SummaryCard label="実績合計" value={formatMinutes(summary.actual)} />
        <SummaryCard
          label="差分"
          value={`${diff >= 0 ? '+' : ''}${diff}分`}
          tone={diff > 0 ? 'negative' : 'positive'}
        />
      </div>

      <div className={styles.sections}>
        {SECTIONS.map((s) => (
          <section key={s.value}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>{s.label}</h2>
              <p className={styles.sectionCount}>
                {grouped[s.value as SectionValue].length} 件
              </p>
            </div>
            <div className={styles.taskList}>
              {grouped[s.value as SectionValue].map((t) => (
                <TaskRow key={t.id} task={t} />
              ))}
              <SectionInlineTaskInput date={date} section={s.value} />
            </div>
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
    <div className={styles.summaryCard}>
      <div className={styles.summaryLabel}>{label}</div>
      <div
        className={cx(
          styles.summaryValue,
          tone === 'positive' && styles.summaryValuePositive,
          tone === 'negative' && styles.summaryValueNegative,
        )}
      >
        {value}
      </div>
    </div>
  )
}
