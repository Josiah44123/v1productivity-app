"use client"

import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import { Navigation } from "./navigation"
import { ProfileHeader } from "./profile-header"
import { InteractiveBackground } from "./interactive-background"

import { useTheme } from "next-themes"

interface DashboardLayoutProps {
  children: ReactNode
  activeTab: string
  setActiveTab: (tab: string) => void
  darkMode?: boolean
  setDarkMode?: (value: boolean) => void
}

export function DashboardLayout({ children, activeTab, setActiveTab, darkMode, setDarkMode }: DashboardLayoutProps) {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()
  const isDark = darkMode ?? (theme === "dark")
  const handleSetDarkMode = setDarkMode ?? (() => {})

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div
      className={`min-h-screen bg-transparent text-foreground relative flex flex-col overflow-x-hidden ${isDark ? "dark" : ""}`}
    >
      <InteractiveBackground darkMode={isDark} />

      <ProfileHeader darkMode={isDark} setDarkMode={handleSetDarkMode} activeTab={activeTab} />

      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 p-6 md:p-8 relative z-10 animate-in fade-in duration-500">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
