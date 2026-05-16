import React, { useState } from 'react'
import { router } from '@inertiajs/react'
import { Loader2, Play } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import styles from './TaskForm.module.css'

export default function TaskForm() {
  const [title, setTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    router.post(
      '/tasks/start_now',
      { task: { title: title.trim() } },
      {
        preserveScroll: true,
        onFinish: () => {
          setSubmitting(false)
          setTitle('')
        },
      },
    )
  }

  return (
    <form onSubmit={submit} className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="task-title">タイトル（任意）</label>
        <input
          id="task-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="いま始める作業"
        />
      </div>
      <div>
        <Button type="submit" disabled={submitting}>
          {submitting ? <Loader2 className={styles.spin} /> : <Play />}
          いま開始
        </Button>
      </div>
    </form>
  )
}
