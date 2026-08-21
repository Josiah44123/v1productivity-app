"use client"

import { Button } from "@/components/ui/button"
import { Home, CheckSquare2, Calendar, BookOpen, Link2, TrendingUp, Settings } from "lucide-react"

interface NavigationProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  isCollapsed?: boolean
}

export function Navigation({ activeTab, setActiveTab, isCollapsed }: NavigationProps) {
  const navItems = [
    { id: "home", label: "Dashboard", icon: Home },
    { id: "tasks", label: "Tasks", icon: CheckSquare2 },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "notes", label: "Notes", icon: BookOpen },
    { id: "links", label: "Links", icon: Link2 },
    { id: "progress", label: "Progress", icon: TrendingUp },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  return (
    <nav className="p-4 space-y-2 flex flex-col items-center md:items-stretch">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = activeTab === item.id
        
        return (
          <Button
            key={item.id}
            variant={isActive ? "default" : "ghost"}
            title={isCollapsed ? item.label : undefined}
            className={`transition-all duration-200 text-sm font-medium ${
              isCollapsed ? "w-10 h-10 p-0 justify-center rounded-xl" : "w-full justify-start px-4 py-2"
            } ${
              isActive
                ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md border-none"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            onClick={() => setActiveTab(item.id)}
          >
            <Icon className={`flex-shrink-0 ${isCollapsed ? "w-5 h-5" : "w-4 h-4 mr-3"}`} />
            {!isCollapsed && <span>{item.label}</span>}
          </Button>
        )
      })}
    </nav>
  )
}
