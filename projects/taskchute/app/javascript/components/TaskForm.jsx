import React, { useState } from 'react'
import { router } from '@inertiajs/react'
import { Input } from 'baseui/input'
import { Select } from 'baseui/select'
import { Button, KIND, SIZE } from 'baseui/button'
import { FormControl } from 'baseui/form-control'
import { useStyletron } from 'baseui'
import { SECTIONS } from '../lib/format'

export default function TaskForm({ date }) {
  const [css] = useStyletron()
  const [title, setTitle] = useState('')
  const [section, setSection] = useState([SECTIONS[0]])
  const [estimate, setEstimate] = useState('15')
  const [submitting, setSubmitting] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    if (!title.trim() || submitting) return
    setSubmitting(true)
    router.post(
      '/tasks',
      {
        task: {
          title: title.trim(),
          section: section[0]?.value || 'morning',
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
      }
    )
  }

  return (
    <form
      onSubmit={submit}
      className={css({
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 120px 90px auto',
        columnGap: '12px',
        rowGap: '0',
        alignItems: 'end',
        marginBottom: '24px',
      })}
    >
      <div className={css({ minWidth: 0 })}>
        <FormControl label="タイトル">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="新しいタスク"
            required
          />
        </FormControl>
      </div>
      <div>
        <FormControl label="セクション">
          <Select
            options={SECTIONS}
            value={section}
            onChange={({ value }) => setSection(value.length ? value : [SECTIONS[0]])}
            clearable={false}
            searchable={false}
          />
        </FormControl>
      </div>
      <div>
        <FormControl label="見積(分)">
          <Input
            type="number"
            min={0}
            value={estimate}
            onChange={(e) => setEstimate(e.target.value)}
          />
        </FormControl>
      </div>
      <div className={css({ display: 'flex', alignItems: 'center', height: '48px' })}>
        <Button
          type="submit"
          kind={KIND.primary}
          size={SIZE.compact}
          isLoading={submitting}
          disabled={!title.trim()}
        >
          追加
        </Button>
      </div>
    </form>
  )
}
