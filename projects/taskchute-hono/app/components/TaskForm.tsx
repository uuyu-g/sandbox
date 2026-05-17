import React, { useState } from 'react'
import { router } from '@inertiajs/react'
import { Loader2, Play } from 'lucide-react'

import { Button } from '@/components/ui/Button'

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
    <form data-task-form onSubmit={submit}>
      <p>
        <label htmlFor="task-title">タイトル（任意）</label>
        <input
          id="task-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="いま始める作業"
        />
      </p>
      <div>
        <Button type="submit" disabled={submitting}>
          {submitting ? <Loader2 data-spin /> : <Play />}
          いま開始
        </Button>
      </div>
    </form>
  )
}
