'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider baseUrl={typeof window !== 'undefined' ? window.location.origin : ''}>
      {children}
    </SessionProvider>
  )
}
