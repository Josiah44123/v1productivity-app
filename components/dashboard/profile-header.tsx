"use client"

import { Github, Linkedin, Twitter, Sun, Moon } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useTheme } from "next-themes"

interface ProfileHeaderProps {
  darkMode: boolean
  setDarkMode: (value: boolean) => void
  isCollapsed?: boolean
}

export function ProfileHeader({ darkMode, setDarkMode, isCollapsed }: ProfileHeaderProps) {
  const [username] = useLocalStorage("user-name", "Josiah Rosell")
  const { theme, setTheme } = useTheme()

  const initials = username
    ? username
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "JR"

  const toggleTheme = () => {
    const nextIsDark = theme === "dark" ? false : true
    setTheme(nextIsDark ? "dark" : "light")
    setDarkMode(nextIsDark)
  }

  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center gap-6 relative z-30 w-full">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-0.5 flex flex-shrink-0 items-center justify-center">
          <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
            <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {initials}
            </span>
          </div>
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-colors"
          title="Toggle Theme"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 relative z-30 w-full animate-in fade-in">
      <div className="flex items-center justify-between">
        <div className="text-lg font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Productivity Hub
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
          title="Toggle Theme"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-0.5 flex flex-shrink-0 items-center justify-center shadow-sm">
          <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
            <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {initials}
            </span>
          </div>
        </div>
        <div className="min-w-0">
          <h2 className="font-semibold text-sm text-gray-900 dark:text-white truncate">{username}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Student</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
        <a
          href="https://josiahrosell.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
        >
          Portfolio
        </a>
        <a href="#" className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          <Github className="w-4 h-4" />
        </a>
        <a href="#" className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <Linkedin className="w-4 h-4" />
        </a>
        <a href="#" className="p-1 text-gray-400 hover:text-blue-400 dark:hover:text-blue-400 transition-colors">
          <Twitter className="w-4 h-4" />
        </a>
      </div>
    </div>
  )
}