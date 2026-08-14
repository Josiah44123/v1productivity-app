"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { DashboardHome } from "@/components/dashboard/home"
import { TasksSection } from "@/components/dashboard/tasks-section"
import { CalendarSection } from "@/components/dashboard/calendar-section"
import { NotesSection } from "@/components/dashboard/notes-section"
import { LinksHub } from "@/components/dashboard/links-hub"
import { ProgressTracker } from "@/components/dashboard/progress-tracker"
import { SettingsPage } from "@/components/dashboard/settings"
import { getTasks } from "@/app/actions"

// Main landing page and authentication router
export default function Page() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [activeTab, setActiveTab] = useState("home")
  const [tasks, setTasks] = useState<any[]>([])
  
  // Dummy data for unimplemented features
  const [notes, setNotes] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated") {
      loadData()
    }
  }, [status, router])

  const loadData = async () => {
    try {
      const dbTasks = await getTasks()
      setTasks(dbTasks)
    } catch (e) {
      console.error(e)
    }
  }

  if (status === "loading" || status === "unauthenticated") {
    return <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">Loading...</div>
  }

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <DashboardHome tasks={tasks} events={events} notes={notes} />
      case "tasks":
        return <TasksSection tasks={tasks} setTasks={setTasks} refreshTasks={loadData} />
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
