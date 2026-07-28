"use client"

import { Button } from "@/components/ui/button"
import { Home, CheckSquare2, Calendar, BookOpen, Link2, TrendingUp, Menu, Settings } from "lucide-react"
import { useState } from "react"

interface NavigationProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function Navigation({ activeTab, setActiveTab }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { id: "home", label: "Dashboard", icon: Home },
    { id: "tasks", label: "Tasks", icon: CheckSquare2 },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "notes", label: "Notes", icon: BookOpen },
    { id: "links", label: "Quick Links", icon: Link2 },
    { id: "progress", label: "Progress", icon: TrendingUp },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  return (
    <nav className="border-b border-border bg-card/90 backdrop-blur-md sticky top-[57px] z-20 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 dark:from-blue-400 dark:via-purple-400 dark:to-orange-400 bg-clip-text text-transparent">
            Productivity Hub
          </div>

          <button className="md:hidden p-2 text-foreground" onClick={() => setIsOpen(!isOpen)}>
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden md:flex gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className={`gap-2 transition-all text-sm font-medium ${
                    activeTab === item.id
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm hover:opacity-95"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
                  }`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              )
            })}
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden mt-4 flex flex-col gap-2 animate-in fade-in">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className={`w-full justify-start gap-2 ${activeTab === item.id ? "text-white" : ""}`}
                  onClick={() => {
                    setActiveTab(item.id)
                    setIsOpen(false)
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              )
            })}
          </div>
        )}
      </div>
    </nav>
  )
}
