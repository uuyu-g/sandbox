import React from 'react'
import { Link, usePage } from '@inertiajs/react'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { url } = usePage()

  const navLink = (href: string, label: string) => {
    const active = url === href || (href !== '/' && url.startsWith(href))
    return (
      <Link href={href} data-active={active ? 'true' : 'false'}>
        {label}
      </Link>
    )
  }

  return (
    <div data-app>
      <header>
        <hgroup>
          <h1>TaskChute</h1>
          <p>1日のタスクをシュートする</p>
        </hgroup>
        <nav>
          {navLink('/', '今日')}
          {navLink('/routines', 'ルーチン')}
        </nav>
      </header>
      <main>{children}</main>
    </div>
  )
}
