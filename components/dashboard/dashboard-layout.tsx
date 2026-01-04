"use client"

import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import { Navigation } from "./navigation"
import { ProfileHeader } from "./profile-header"
import { InteractiveBackground } from "./interactive-background"

interface DashboardLayoutProps {
  children: ReactNode
  activeTab: string
  setActiveTab: (tab: string) => void
  darkMode: boolean
  setDarkMode: (value: boolean) => void
}

export function DashboardLayout({ children, activeTab, setActiveTab, darkMode, setDarkMode }: DashboardLayoutProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div
      className={`min-h-screen bg-transparent text-foreground relative flex flex-col overflow-hidden ${darkMode ? "dark" : ""}`}
    >
      <InteractiveBackground darkMode={darkMode} />

      <ProfileHeader darkMode={darkMode} setDarkMode={setDarkMode} activeTab={activeTab} />

      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 p-6 md:p-8 relative z-10 animate-in fade-in duration-500 overflow-y-auto max-h-[calc(100vh-160px)]">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
