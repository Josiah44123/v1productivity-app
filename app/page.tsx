"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { DashboardHome } from "@/components/dashboard/home"
import { TasksSection } from "@/components/dashboard/tasks-section"
import { CalendarSection } from "@/components/dashboard/calendar-section"
import { NotesSection } from "@/components/dashboard/notes-section"
import { LinksHub } from "@/components/dashboard/links-hub"
import { ProgressTracker } from "@/components/dashboard/progress-tracker"
import { SettingsPage } from "@/components/dashboard/settings"
import { useLocalStorage } from "@/hooks/use-local-storage"

export default function Page() {
  const [activeTab, setActiveTab] = useState("home")
  const [tasks, setTasks] = useLocalStorage("tasks", [])
  const [notes, setNotes] = useLocalStorage("notes", [])
  const [events, setEvents] = useLocalStorage("events", [])

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <DashboardHome tasks={tasks} events={events} notes={notes} />
      case "tasks":
        return <TasksSection tasks={tasks} setTasks={setTasks} />
      case "calendar":
        return <CalendarSection events={events} setEvents={setEvents} />
      case "notes":
        return <NotesSection notes={notes} setNotes={setNotes} />
      case "links":
        return <LinksHub />
      case "progress":
        return <ProgressTracker tasks={tasks} />
      case "settings":
        return <SettingsPage />
      default:
        return <DashboardHome tasks={tasks} events={events} notes={notes} />
    }
  }

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  )
}
