import React, { useState } from 'react'
import { router } from '@inertiajs/react'
import { Loader2, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SECTIONS, type SectionValue } from '@/lib/format'

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
    <form
      onSubmit={submit}
      className="mb-6 grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_140px_110px_auto]"
    >
      <div className="grid gap-1.5">
        <Label htmlFor="task-title">タイトル</Label>
        <Input
          id="task-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="新しいタスク"
          required
        />
      </div>
      <div className="grid gap-1.5">
        <Label>セクション</Label>
        <Select value={section} onValueChange={(v) => setSection(v as SectionValue)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SECTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="task-estimate">見積(分)</Label>
        <Input
          id="task-estimate"
          type="number"
          min={0}
          value={estimate}
          onChange={(e) => setEstimate(e.target.value)}
        />
      </div>
      <div>
        <Button type="submit" disabled={!title.trim() || submitting}>
          {submitting ? <Loader2 className="animate-spin" /> : <Plus />}
          追加
        </Button>
      </div>
    </form>
  )
}
