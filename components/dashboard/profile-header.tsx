"use client"

import { Github, Linkedin, Twitter, Sun, Moon } from "lucide-react"
import { MiniGame } from "./mini-game"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useTheme } from "next-themes"

interface ProfileHeaderProps {
  darkMode: boolean
  setDarkMode: (value: boolean) => void
  activeTab?: string
}

export function ProfileHeader({ darkMode, setDarkMode, activeTab }: ProfileHeaderProps) {
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

  return (
    <div className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30 relative shadow-sm">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 flex-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-orange-500 p-0.5 shadow-sm">
                <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                  <span className="text-xs font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    {initials}
                  </span>
                </div>
              </div>
              <div>
                <h2 className="font-semibold text-sm text-foreground">{username}</h2>
                <p className="text-xs text-muted-foreground">2025 Semester</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <a
                href="https://josiahrosell.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-3 py-1 rounded-full bg-card border border-border hover:border-blue-500/50 hover:shadow-sm transition-all"
              >
                Portfolio
              </a>
              <a href="#" className="p-1 hover:bg-muted rounded transition-colors">
                <Github className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </a>
              <a href="#" className="p-1 hover:bg-muted rounded transition-colors">
                <Linkedin className="w-4 h-4 text-muted-foreground hover:text-blue-600" />
              </a>
              <a href="#" className="p-1 hover:bg-muted rounded transition-colors">
                <Twitter className="w-4 h-4 text-muted-foreground hover:text-blue-400" />
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/80 hover:bg-secondary border border-border text-xs font-medium text-foreground transition-all shadow-sm"
              title="Toggle Light/Dark Mode"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden sm:inline">Dark Mode</span>
                </>
              )}
            </button>
            <MiniGame activeTab={activeTab} />
          </div>
        </div>
      </div>
    </div>
  )
}