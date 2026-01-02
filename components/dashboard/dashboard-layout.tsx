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
}

export function DashboardLayout({ children, activeTab, setActiveTab }: DashboardLayoutProps) {
  const [darkMode, setDarkMode] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedDarkMode = localStorage.getItem("dark-mode")
    const isDark = savedDarkMode === null ? true : JSON.parse(savedDarkMode)
    setDarkMode(isDark)
    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    localStorage.setItem("dark-mode", JSON.stringify(darkMode))
  }, [darkMode, mounted])

  if (!mounted) return null

  return (
    // FIX 1: Changed 'bg-background' to 'bg-transparent' so we can see through it
    <div
      className={`min-h-screen bg-transparent text-foreground relative flex flex-col overflow-hidden ${darkMode ? "dark" : ""}`}
    >
      <InteractiveBackground darkMode={darkMode} />

      <ProfileHeader darkMode={darkMode} setDarkMode={setDarkMode} activeTab={activeTab} />

      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* FIX 2: Added z-10 to ensure content sits ON TOP of the glow */}
      <main className="flex-1 p-6 md:p-8 relative z-10 animate-in fade-in duration-500 overflow-y-auto max-h-[calc(100vh-160px)]">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  )
}