import React from 'react'
import { Link, usePage } from '@inertiajs/react'
import { useStyletron } from 'baseui'
import { HeadingMedium, ParagraphSmall } from 'baseui/typography'

export default function AppLayout({ children }) {
  const [css, theme] = useStyletron()
  const { url } = usePage()

  const navLink = (href, label) => {
    const active = url === href || (href !== '/' && url.startsWith(href))
    return (
      <Link
        href={href}
        className={css({
          padding: '8px 14px',
          borderRadius: '8px',
          textDecoration: 'none',
          color: active ? theme.colors.contentInversePrimary : theme.colors.contentPrimary,
          backgroundColor: active ? theme.colors.backgroundInversePrimary : 'transparent',
          fontWeight: 600,
          fontSize: '14px',
          ':hover': {
            backgroundColor: active ? theme.colors.backgroundInversePrimary : theme.colors.backgroundSecondary,
          },
        })}
      >
        {label}
      </Link>
    )
  }

  return (
    <div
      className={css({
        minHeight: '100vh',
        backgroundColor: theme.colors.backgroundPrimary,
        color: theme.colors.contentPrimary,
      })}
    >
      <header
        className={css({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 32px',
          borderBottom: `1px solid ${theme.colors.borderOpaque}`,
          backgroundColor: theme.colors.backgroundPrimary,
        })}
      >
        <div className={css({ display: 'flex', alignItems: 'baseline', gap: '12px' })}>
          <HeadingMedium marginTop="0" marginBottom="0">TaskChute</HeadingMedium>
          <ParagraphSmall color={theme.colors.contentTertiary} marginTop="0" marginBottom="0">
            1日のタスクをシュートする
          </ParagraphSmall>
        </div>
        <nav className={css({ display: 'flex', gap: '8px' })}>
          {navLink('/', '今日')}
          {navLink('/routines', 'ルーチン')}
        </nav>
      </header>
      <main
        className={css({
          maxWidth: '960px',
          margin: '0 auto',
          padding: '32px 24px',
        })}
      >
        {children}
      </main>
    </div>
  )
}
