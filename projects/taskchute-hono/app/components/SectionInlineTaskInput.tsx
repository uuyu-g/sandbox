import { useRef, useState } from 'react'
import { router } from '@inertiajs/react'

import { type SectionValue, sectionLabel } from '@/lib/format'
import { onEnterKey } from '@/lib/utils'
import styles from './SectionInlineTaskInput.module.css'

interface Props {
  date: string
  section: SectionValue
}

const DEFAULT_ESTIMATE = '15'

export default function SectionInlineTaskInput({ date, section }: Props) {
  const [title, setTitle] = useState('')
  const [estimate, setEstimate] = useState(DEFAULT_ESTIMATE)
  const [submitting, setSubmitting] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)

  const submit = () => {
    const trimmed = title.trim()
    if (!trimmed || submitting) return
    setSubmitting(true)
    router.post(
      '/tasks',
      {
        task: {
          title: trimmed,
          section,
          estimate_minutes: parseInt(estimate, 10) || 0,
          scheduled_on: date,
        },
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setTitle('')
          setEstimate(DEFAULT_ESTIMATE)
          titleRef.current?.focus()
        },
        onFinish: () => setSubmitting(false),
      },
    )
  }

  const onKeyDown = onEnterKey<HTMLInputElement>((e) => {
    e.preventDefault()
    submit()
  })

  const label = sectionLabel(section)

  return (
    <div className={styles.row}>
      <input
        ref={titleRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={`${label} にタスクを追加（Enter で追加）`}
        className={styles.title}
        disabled={submitting}
        aria-label={`${label} の新規タスクのタイトル`}
      />
      <div className={styles.estimateWrap}>
        <input
          type="number"
          min={0}
          value={estimate}
          onChange={(e) => setEstimate(e.target.value)}
          onKeyDown={onKeyDown}
          className={styles.estimate}
          disabled={submitting}
          aria-label={`${label} の新規タスクの見積分`}
        />
        <span className={styles.unit}>分</span>
      </div>
    </div>
  )
}
