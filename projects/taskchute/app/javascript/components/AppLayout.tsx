import React from 'react'
import { Link, usePage } from '@inertiajs/react'

import { cx } from '@/lib/utils'
import styles from './AppLayout.module.css'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { url } = usePage()

  const navLink = (href: string, label: string) => {
    const active = url === href || (href !== '/' && url.startsWith(href))
    return (
      <Link href={href} className={cx(styles.navLink, active && styles.navLinkActive)}>
        {label}
      </Link>
    )
  }

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <h1 className={styles.title}>TaskChute</h1>
          <p className={styles.subtitle}>1日のタスクをシュートする</p>
        </div>
        <nav className={styles.nav}>
          {navLink('/', '今日')}
          {navLink('/routines', 'ルーチン')}
        </nav>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  )
}
