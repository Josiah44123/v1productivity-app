"use client"


import { SessionProvider } from "next-auth/react"

// Client-side providers for session and theme management
export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}

