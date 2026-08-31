"use client"

import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import { Navigation } from "./navigation"
import { ProfileHeader } from "./profile-header"
import { useTheme } from "next-themes"
import { PomodoroTimer } from "./pomodoro-timer"
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"

interface DashboardLayoutProps {
  children: ReactNode
  activeTab: string
  setActiveTab: (tab: string) => void
  darkMode?: boolean
  setDarkMode?: (value: boolean) => void
}

export function DashboardLayout({ children, activeTab, setActiveTab, darkMode, setDarkMode }: DashboardLayoutProps) {
  const [mounted, setMounted] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { theme } = useTheme()
  const isDark = darkMode ?? (theme === "dark")
  const handleSetDarkMode = setDarkMode ?? (() => {})

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div
      className={`min-h-screen bg-white text-slate-900 transition-colors duration-300 flex flex-col md:flex-row overflow-x-hidden ${isDark ? "dark bg-slate-950 text-slate-100" : ""}`}
    >
      {/* Sidebar Navigation */}
      <aside 
        className={`flex-shrink-0 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col z-20 transition-all duration-300 ease-in-out relative ${
          isCollapsed ? "w-full md:w-20" : "w-full md:w-64"
        }`}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1 shadow-sm text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 z-50 hidden md:flex transition-transform hover:scale-110"
        >
          {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>

        <div className="p-4 border-b border-slate-200 dark:border-slate-800 min-h-[72px] flex items-center justify-center">
          <ProfileHeader darkMode={isDark} setDarkMode={handleSetDarkMode} isCollapsed={isCollapsed} />
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <Navigation activeTab={activeTab} setActiveTab={setActiveTab} isCollapsed={isCollapsed} />
        </div>
        
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <PomodoroTimer isCollapsed={isCollapsed} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 relative z-10 animate-in fade-in duration-500 overflow-y-auto bg-white dark:bg-slate-950">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
