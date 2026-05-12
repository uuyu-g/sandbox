import React, { useMemo } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { useStyletron } from 'baseui'
import { HeadingSmall, LabelMedium, ParagraphSmall } from 'baseui/typography'
import { Button, KIND, SIZE } from 'baseui/button'
import { Input } from 'baseui/input'
import TaskForm from '../components/TaskForm'
import TaskRow from '../components/TaskRow'
import { SECTIONS, formatMinutes, sectionLabel } from '../lib/format'

export default function Today({ date, tasks, summary }) {
  const [css, theme] = useStyletron()
  const { flash } = usePage().props

  const grouped = useMemo(() => {
    const map = Object.fromEntries(SECTIONS.map((s) => [s.value, []]))
    for (const t of tasks) {
      ;(map[t.section] || (map[t.section] = [])).push(t)
    }
    return map
  }, [tasks])

  const changeDate = (delta) => {
    const d = new Date(date + 'T00:00:00')
    d.setDate(d.getDate() + delta)
    router.get('/', { date: d.toISOString().slice(0, 10) }, { preserveScroll: true })
  }

  const setDate = (iso) => {
    if (!iso) return
    router.get('/', { date: iso }, { preserveScroll: true })
  }

  const expandRoutines = () => {
    router.post('/routines/expand', { date }, { preserveScroll: true })
  }

  return (
    <div>
      <Head title={`TaskChute - ${date}`} />

      <div
        className={css({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          gap: '12px',
          flexWrap: 'wrap',
        })}
      >
        <div className={css({ display: 'flex', alignItems: 'center', gap: '8px' })}>
          <Button size={SIZE.compact} kind={KIND.tertiary} onClick={() => changeDate(-1)}>← 前日</Button>
          <div className={css({ width: '170px' })}>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              size={SIZE.compact}
            />
          </div>
          <Button size={SIZE.compact} kind={KIND.tertiary} onClick={() => changeDate(1)}>翌日 →</Button>
          <Button size={SIZE.compact} kind={KIND.tertiary} onClick={() => setDate(new Date().toISOString().slice(0, 10))}>今日</Button>
        </div>
        <Button size={SIZE.compact} kind={KIND.secondary} onClick={expandRoutines}>
          ⟲ ルーチンを展開
        </Button>
      </div>

      {flash?.notice && (
        <div
          className={css({
            padding: '8px 12px',
            marginBottom: '16px',
            borderRadius: '6px',
            backgroundColor: theme.colors.backgroundAccentLight,
            color: theme.colors.contentPrimary,
            fontSize: '13px',
          })}
        >
          {flash.notice}
        </div>
      )}

      <TaskForm date={date} />

      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          marginBottom: '24px',
        })}
      >
        <SummaryCard label="タスク" value={`${summary.done_count} / ${summary.total_count}`} />
        <SummaryCard label="見積合計" value={formatMinutes(summary.estimate)} />
        <SummaryCard label="実績合計" value={formatMinutes(summary.actual)} />
        <SummaryCard
          label="差分"
          value={`${summary.actual - summary.estimate >= 0 ? '+' : ''}${summary.actual - summary.estimate}分`}
          tone={summary.actual - summary.estimate > 0 ? 'negative' : 'positive'}
        />
      </div>

      <div className={css({ display: 'flex', flexDirection: 'column', gap: '24px' })}>
        {SECTIONS.map((s) => (
          <section key={s.value}>
            <div className={css({ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '8px' })}>
              <HeadingSmall marginTop="0" marginBottom="0">{s.label}</HeadingSmall>
              <ParagraphSmall color={theme.colors.contentTertiary} marginTop="0" marginBottom="0">
                {grouped[s.value].length} 件
              </ParagraphSmall>
            </div>
            {grouped[s.value].length === 0 ? (
              <div
                className={css({
                  padding: '16px',
                  borderRadius: '10px',
                  border: `1px dashed ${theme.colors.borderOpaque}`,
                  color: theme.colors.contentTertiary,
                  fontSize: '13px',
                  textAlign: 'center',
                })}
              >
                {sectionLabel(s.value)} のタスクはまだありません
              </div>
            ) : (
              <div className={css({ display: 'flex', flexDirection: 'column', gap: '8px' })}>
                {grouped[s.value].map((t) => (
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

function SummaryCard({ label, value, tone }) {
  const [css, theme] = useStyletron()
  const color =
    tone === 'positive' ? theme.colors.positive : tone === 'negative' ? theme.colors.negative : theme.colors.contentPrimary
  return (
    <div
      className={css({
        padding: '14px 16px',
        borderRadius: '10px',
        border: `1px solid ${theme.colors.borderOpaque}`,
        backgroundColor: theme.colors.backgroundPrimary,
      })}
    >
      <LabelMedium color={theme.colors.contentTertiary} marginTop="0" marginBottom="4px">{label}</LabelMedium>
      <div className={css({ fontSize: '22px', fontWeight: 700, color })}>{value}</div>
    </div>
  )
}
