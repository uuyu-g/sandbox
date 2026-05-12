import React, { useState } from 'react'
import { router } from '@inertiajs/react'
import { Loader2, Plus } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { SECTIONS, type SectionValue } from '@/lib/format'
import styles from './TaskForm.module.css'

interface Props {
  date: string
}

export default function TaskForm({ date }: Props) {
  const [title, setTitle] = useState('')
  const [section, setSection] = useState<SectionValue>(SECTIONS[0].value)
  const [estimate, setEstimate] = useState('15')
  const [submitting, setSubmitting] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || submitting) return
    setSubmitting(true)
    router.post(
      '/tasks',
      {
        task: {
          title: title.trim(),
          section,
          estimate_minutes: parseInt(estimate, 10) || 0,
          scheduled_on: date,
        },
      },
      {
        preserveScroll: true,
        onFinish: () => {
          setSubmitting(false)
          setTitle('')
          setEstimate('15')
        },
      },
    )
  }

  return (
    <form onSubmit={submit} className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="task-title">タイトル</label>
        <input
          id="task-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="新しいタスク"
          required
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="task-section">セクション</label>
        <select
          id="task-section"
          value={section}
          onChange={(e) => setSection(e.target.value as SectionValue)}
        >
          {SECTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.field}>
        <label htmlFor="task-estimate">見積(分)</label>
        <input
          id="task-estimate"
          type="number"
          min={0}
          value={estimate}
          onChange={(e) => setEstimate(e.target.value)}
        />
      </div>
      <div>
        <Button type="submit" disabled={!title.trim() || submitting}>
          {submitting ? <Loader2 className={styles.spin} /> : <Plus />}
          追加
        </Button>
      </div>
    </form>
  )
}
