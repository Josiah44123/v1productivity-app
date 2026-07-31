"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { format, isToday, isTomorrow } from "date-fns"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { useLocalStorage } from "@/hooks/use-local-storage"
import {
  CheckCircle2,
  Circle,
  CalendarOff,
  Palette,
  Award,
  Sparkles,
  AlertCircle,
  Clock,
  ArrowRight,
  Flame
} from "lucide-react"
import { WeeklyReflectionModal, type Column, type Task } from "./weekly-reflection-modal"

const THEMES: Record<string, any> = {
  ocean: {
    label: "Ocean",
    primary: "#0284c7",
    secondary: "#3b82f6",
    activeBorder: "hover:border-sky-500/50",
    progress: "bg-sky-500",
    chartColors: ["#0284c7", "#3b82f6", "#0ea5e9", "#6366f1", "#8b5cf6"],
  },
  berry: {
    label: "Berry",
    primary: "#db2777",
    secondary: "#d946ef",
    activeBorder: "hover:border-pink-500/50",
    progress: "bg-pink-500",
    chartColors: ["#db2777", "#d946ef", "#be185d", "#a21caf", "#fb7185"],
  },
  forest: {
    label: "Forest",
    primary: "#059669",
    secondary: "#22c55e",
    activeBorder: "hover:border-emerald-500/50",
    progress: "bg-emerald-500",
    chartColors: ["#059669", "#34d399", "#10b981", "#84cc16", "#bef264"],
  },
  royal: {
    label: "Royal",
    primary: "#7c3aed",
    secondary: "#a855f7",
    activeBorder: "hover:border-violet-500/50",
    progress: "bg-violet-500",
    chartColors: ["#7c3aed", "#a855f7", "#8b5cf6", "#6366f1", "#c084fc"],
  },
  sunset: {
    label: "Sunset",
    primary: "#ea580c",
    secondary: "#f59e0b",
    activeBorder: "hover:border-orange-500/50",
    progress: "bg-orange-500",
    chartColors: ["#ea580c", "#f59e0b", "#f97316", "#d97706", "#fbbf24"],
  },
}

interface HomeProps {
  tasks: Task[]
  events: any[]
  notes: any[]
}

const DEFAULT_COLUMNS: Column[] = [
  { id: "acads", title: "Acads", colorTheme: "red" },
  { id: "org", title: "Org", colorTheme: "yellow" },
  { id: "work", title: "Work", colorTheme: "green" },
]

// Custom Tooltip Component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-card border border-border p-3 rounded-xl shadow-lg z-50">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full shadow-2xs" style={{ backgroundColor: data.color }} />
          <p className="text-foreground text-sm font-semibold">{data.name}</p>
        </div>
        <p className="text-xs text-muted-foreground pl-5">
          {data.value} {data.value === 1 ? "task" : "tasks"}
        </p>
      </div>
    )
  }
  return null
}

export function DashboardHome({ tasks = [], events = [], notes = [] }: HomeProps) {
  const [username] = useLocalStorage("user-name", "Josiah")
  const [themeKey, setThemeKey] = useLocalStorage("dashboard-theme", "ocean")
  const [columns] = useLocalStorage<Column[]>("task_columns", DEFAULT_COLUMNS)
  const [storedTasks, setStoredTasks] = useLocalStorage<any[]>("tasks", [])
  const [isReflectionOpen, setIsReflectionOpen] = useState(false)

  const theme = THEMES[themeKey] || THEMES.ocean

  const completedTasks = tasks.filter((t) => t.completed).length
  const completionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0

  const todayEvents = events.filter((e: any) => {
    const eventDate = new Date(e.date).toDateString()
    return eventDate === new Date().toDateString()
  })

  // Highlight all upcoming uncompleted tasks, sorted by nearest deadline
  const upcomingTasks = tasks
    .filter((t) => !t.completed)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  // Ensure task mapping to column ID
  const getTaskColumnId = (task: Task): string => {
    if (task.columnId && columns.some((c) => c.id === task.columnId)) {
      return task.columnId
    }
    const cat = (task.category || "").toLowerCase()
    const subj = (task.subject || "").toLowerCase()
    if (cat === "organization" || subj.includes("org")) return "org"
    if (cat === "hobby" || subj.includes("work") || subj.includes("job")) return "work"
    return "acads"
  }

  // 1. Straightforward Urgency Data (Urgent / Medium / Low) without jargon
  const urgencyData = useMemo(() => [
    {
      name: "Urgent (High)",
      value: tasks.filter((t) => !t.completed && (t.urgency === "critical" || t.priority === "high")).length,
      color: "#ef4444",
    },
    {
      name: "Normal (Medium)",
      value: tasks.filter((t) => !t.completed && (t.urgency === "moderate" || t.priority === "medium")).length,
      color: "#f59e0b",
    },
    {
      name: "Can Wait (Low)",
      value: tasks.filter((t) => !t.completed && (t.urgency === "minor" || t.priority === "low")).length,
      color: "#10b981",
    },
  ].filter((item) => item.value > 0), [tasks])

  // 2. Straightforward Workload by Column (Acads • Org • Work)
  const columnWorkloadData = useMemo(() => {
    return columns
      .map((col) => {
        let color = "#64748b"
        if (col.colorTheme === "red") color = "#ef4444"
        else if (col.colorTheme === "yellow") color = "#f59e0b"
        else if (col.colorTheme === "green") color = "#10b981"
        else if (col.colorTheme === "blue") color = "#3b82f6"
        else if (col.colorTheme === "purple") color = "#8b5cf6"

        const count = tasks.filter((t) => !t.completed && getTaskColumnId(t) === col.id).length
        return {
          name: col.title,
          value: count,
          color,
        }
      })
      .filter((item) => item.value > 0)
  }, [tasks, columns])

  const totalActiveTasks = tasks.filter((t) => !t.completed).length
  const emptyData = [{ name: "No Active Tasks", value: 1, color: "#94a3b8" }]

  const getColBadgeClass = (themeName: string) => {
    switch (themeName) {
      case "red":
        return "bg-red-500 text-white"
      case "yellow":
        return "bg-amber-500 text-white"
      case "green":
        return "bg-emerald-500 text-white"
      case "blue":
        return "bg-blue-500 text-white"
      case "purple":
        return "bg-purple-500 text-white"
      default:
        return "bg-slate-500 text-white"
    }
  }

  const getColBarClass = (themeName: string) => {
    switch (themeName) {
      case "red":
        return "bg-red-500"
      case "yellow":
        return "bg-amber-500"
      case "green":
        return "bg-emerald-500"
      case "blue":
        return "bg-blue-500"
      case "purple":
        return "bg-purple-500"
      default:
        return "bg-slate-500"
    }
  }

  // Quick check-off task from dashboard
  const handleToggleTask = (taskId: string) => {
    const updated = storedTasks.map((t: any) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    setStoredTasks(updated)
  }

  const formatDeadlineBadge = (dueDateStr: string) => {
    try {
      const d = new Date(dueDateStr)
      if (isToday(d)) {
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800">
            <Flame className="w-3 h-3" /> Due Today
          </span>
        )
      }
      if (isTomorrow(d)) {
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3 h-3" /> Due Tomorrow
          </span>
        )
      }
      return (
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
          Due {format(d, "MMM d")}
        </span>
      )
    } catch {
      return null
    }
  }

  return (
    <div className="relative min-h-screen space-y-6 animate-in fade-in duration-500 p-1">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              {getGreeting()}, <span style={{ color: theme.primary }}>{username}</span>
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow-xs">
              3rd Year • 1st Sem
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm font-medium">
            {format(new Date(), "EEEE, MMMM d, yyyy")} • Track deadlines, column progress, and workload straightforwardly
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={() => setIsReflectionOpen(true)}
            className="text-xs rounded-full bg-gradient-to-r from-amber-500 to-red-500 text-white font-medium shadow-sm hover:opacity-95 gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Weekly Reflection Journal
          </Button>

          {/* Theme Color Palette */}
          <div className="flex items-center gap-2 bg-secondary/70 px-3 py-1.5 rounded-full border border-border">
            <Palette className="w-3.5 h-3.5 text-muted-foreground" />
            <div className="flex gap-1.5">
              {Object.keys(THEMES).map((key) => (
                <button
                  key={key}
                  onClick={() => setThemeKey(key)}
                  className={`w-5 h-5 rounded-full border transition-all ${
                    themeKey === key
                      ? "border-foreground scale-110 shadow-xs"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: THEMES[key].primary }}
                  title={THEMES[key].label}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- HERO: 3rd YEAR • 1st SEM COLUMNS CHECKLIST (Acads • Org • Work) --- */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            3rd Year • 1st Sem Column Checklist
          </h2>
          <span className="text-xs font-semibold text-muted-foreground">
            {completedTasks}/{tasks.length} total tasks done
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {columns.map((col) => {
            const colTasks = tasks.filter((t) => getTaskColumnId(t) === col.id)
            const completed = colTasks.filter((t) => t.completed).length
            const total = colTasks.length
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0

            return (
              <Card key={col.id} className="border border-border bg-card shadow-xs hover:shadow-sm transition-all">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full ${getColBadgeClass(col.colorTheme)}`}>
                      {col.title}
                    </span>
                    <span className="text-sm font-black text-foreground">{pct}%</span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-1 space-y-1.5">
                  <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={`h-full ${getColBarClass(col.colorTheme)} transition-all duration-500 rounded-full`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-muted-foreground font-medium">
                    <span>Checklist items</span>
                    <span>{completed}/{total} finished</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* --- FEATURED & HIGHLIGHTED UPCOMING TASKS SECTION --- */}
      <Card className="border-2 border-blue-500/30 bg-card shadow-sm">
        <CardHeader className="p-4 border-b border-border bg-blue-500/5">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-blue-500" />
                Upcoming Deadlines &amp; Tasks (Highlighted)
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                All pending tasks from Acads, Org, and Work sorted by closest due date
              </CardDescription>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {upcomingTasks.length} Active Tasks
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map((task: any) => {
                const colId = getTaskColumnId(task)
                const col = columns.find((c) => c.id === colId) || columns[0]
                const colTheme = col ? col.colorTheme : "slate"

                return (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-border bg-card hover:bg-secondary/40 transition-all shadow-2xs group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        className="text-muted-foreground hover:text-emerald-500 transition-colors shrink-0"
                        title="Click to mark as done"
                      >
                        <Circle className="w-5 h-5" />
                      </button>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground leading-snug truncate">
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${getColBadgeClass(
                              colTheme
                            )}`}
                          >
                            {col ? col.title : "Acads"}
                          </span>

                          {formatDeadlineBadge(task.dueDate)}

                          {task.subtasks && task.subtasks.length > 0 && (
                            <span className="text-[11px] text-muted-foreground font-medium">
                              ☑ {task.subtasks.filter((s: any) => s.completed).length}/{task.subtasks.length} steps
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-500 hover:text-white transition-all"
                      >
                        Done ✓
                      </button>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <CheckCircle2 className="w-10 h-10 mb-2 opacity-30 text-emerald-500" />
                <p className="text-sm font-semibold text-foreground">No upcoming tasks pending!</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  You are all caught up for 3rd Year • 1st Semester! 🎉
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* --- STRAIGHTFORWARD CHARTS (No Jargon!) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Task Urgency (High / Normal / Low) */}
        <Card className="border border-border bg-card shadow-sm flex flex-col">
          <CardHeader className="pb-1">
            <CardTitle className="text-base text-foreground font-bold flex items-center justify-between">
              <span>Task Urgency (What Needs Attention)</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                {totalActiveTasks} pending
              </span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Straightforward breakdown of tasks by how soon they require action
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-[220px] relative flex flex-col items-center justify-center pb-6">
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mb-10">
              <span className="text-4xl font-black text-foreground tracking-tight">{totalActiveTasks}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-0.5">
                Pending Tasks
              </span>
            </div>
            <div className="h-[170px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={urgencyData.length > 0 ? urgencyData : emptyData}
                    cx="50%" cy="50%" innerRadius={50} outerRadius={70}
                    paddingAngle={5} dataKey="value" stroke="none" cornerRadius={5}
                  >
                    {(urgencyData.length > 0 ? urgencyData : emptyData).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity cursor-pointer" />
                    ))}
                  </Pie>
                  {urgencyData.length > 0 && <Tooltip content={<CustomTooltip />} />}
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Clear Plain English Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-xs font-semibold text-foreground">Urgent (High)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="text-xs font-semibold text-foreground">Normal (Medium)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-xs font-semibold text-foreground">Can Wait (Low)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: Workload by Column (Acads • Org • Work) */}
        <Card className="border border-border bg-card shadow-sm flex flex-col">
          <CardHeader className="pb-1">
            <CardTitle className="text-base text-foreground font-bold flex items-center justify-between">
              <span>Workload by Column (Acads • Org • Work)</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                3 Columns
              </span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              See how many pending tasks are in each of your main columns
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-[220px] relative flex flex-col items-center justify-center pb-6">
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mb-10">
              <span className="text-4xl font-black text-foreground tracking-tight">{totalActiveTasks}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-0.5">
                Total Active
              </span>
            </div>
            <div className="h-[170px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={columnWorkloadData.length > 0 ? columnWorkloadData : emptyData}
                    cx="50%" cy="50%" innerRadius={50} outerRadius={70}
                    paddingAngle={5} dataKey="value" stroke="none" cornerRadius={5}
                  >
                    {(columnWorkloadData.length > 0 ? columnWorkloadData : emptyData).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity cursor-pointer" />
                    ))}
                  </Pie>
                  {columnWorkloadData.length > 0 && <Tooltip content={<CustomTooltip />} />}
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Clear Legend for Columns */}
            <div className="flex flex-wrap justify-center gap-4 mt-2 px-2">
              {columnWorkloadData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-semibold text-foreground">{item.name}</span>
                  <span className="text-xs text-muted-foreground">({item.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- TODAY'S SCHEDULE SECTION --- */}
      <Card className="border border-border bg-card shadow-sm">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base text-foreground font-bold">
                Today&apos;s Schedule &amp; Meetings
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {todayEvents.length} events scheduled for today
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {todayEvents.length > 0 ? (
              todayEvents
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((event: any) => (
                  <div
                    key={event.id}
                    className="p-3 rounded-xl hover:bg-secondary/60 transition-all border border-border"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-foreground line-clamp-1">{event.title}</p>
                        <p className="text-xs font-mono mt-1 font-bold" style={{ color: theme.secondary }}>
                          {format(new Date(event.date), "h:mm a")}
                        </p>
                        {event.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{event.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <CalendarOff className="w-10 h-10 mb-2 opacity-30 text-blue-500" />
                <p className="text-sm font-semibold">Clear schedule today. Great time to focus on your Acads! 📚</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <WeeklyReflectionModal
        isOpen={isReflectionOpen}
        onClose={() => setIsReflectionOpen(false)}
        tasks={tasks}
        columns={columns}
      />
    </div>
  )
}