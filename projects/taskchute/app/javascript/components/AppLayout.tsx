import React from 'react'
import { Link, usePage } from '@inertiajs/react'
import { cn } from '@/lib/utils'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { url } = usePage()

  const navLink = (href: string, label: string) => {
    const active = url === href || (href !== '/' && url.startsWith(href))
    return (
      <Link
        href={href}
        className={cn(
          'rounded-md px-3 py-2 text-sm font-semibold transition-colors',
          active
            ? 'bg-primary text-primary-foreground'
            : 'text-foreground hover:bg-secondary',
        )}
      >
        {label}
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4 sm:px-8">
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl font-bold tracking-tight">TaskChute</h1>
          <p className="text-sm text-muted-foreground">1日のタスクをシュートする</p>
        </div>
        <nav className="flex gap-2">
          {navLink('/', '今日')}
          {navLink('/routines', 'ルーチン')}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  )
}
