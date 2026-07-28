"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { CheckCircle2, CalendarOff, Palette, Award, Sparkles } from "lucide-react"
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
        <div className="flex items-center gap-3 mb-1">
          <div className="w-3 h-3 rounded-full shadow-2xs" style={{ backgroundColor: data.color }} />
          <p className="text-foreground text-sm font-semibold">{data.name}</p>
        </div>
        <p className="text-xs text-muted-foreground pl-6">
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
  const [isReflectionOpen, setIsReflectionOpen] = useState(false)

  const theme = THEMES[themeKey] || THEMES.ocean

  const completedTasks = tasks.filter((t) => t.completed).length
  const completionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0

  const todayEvents = events.filter((e: any) => {
    const eventDate = new Date(e.date).toDateString()
    return eventDate === new Date().toDateString()
  })

  const upcomingTasks = tasks
    .filter((t) => !t.completed)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5)

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const thisMonthTasks = tasks.filter((t) => {
    const taskDate = new Date(t.dueDate)
    return taskDate.getMonth() === currentMonth && taskDate.getFullYear() === currentYear
  })
  const thisMonthCompleted = thisMonthTasks.filter((t) => t.completed).length
  const thisMonthRate = thisMonthTasks.length > 0 ? (thisMonthCompleted / thisMonthTasks.length) * 100 : 0

  const urgencyData = useMemo(() => [
    { name: "Critical", value: tasks.filter((t) => t.urgency === "critical").length, color: "#ef4444" },
    { name: "Moderate", value: tasks.filter((t) => t.urgency === "moderate").length, color: "#f59e0b" },
    { name: "Minor", value: tasks.filter((t) => t.urgency === "minor").length, color: "#10b981" },
  ].filter((item) => item.value > 0), [tasks])

  const categoryData = useMemo(() => {
    const categories = [
      { id: "major-subject", label: "Major Subject" },
      { id: "minor-subject", label: "Minor Subject" },
      { id: "hobby", label: "Hobby" },
      { id: "extracurricular", label: "Extracurricular" },
      { id: "organization", label: "Organization" },
    ]

    return categories.map((cat, index) => ({
      name: cat.label,
      value: tasks.filter((t) => t.category === cat.id).length,
      color: theme.chartColors[index % theme.chartColors.length]
    })).filter((item) => item.value > 0)
  }, [tasks, theme])

  const totalTasks = tasks.length
  const emptyData = [{ name: "No Data", value: 1, color: "#64748b" }]

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

  return (
    <div className="relative min-h-screen space-y-6 animate-in fade-in duration-500 p-1">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            {getGreeting()}, <span style={{ color: theme.primary }}>{username}</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">
            {format(new Date(), "EEEE, MMMM d, yyyy")} • Crisp light mode &amp; independent task columns
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={() => setIsReflectionOpen(true)}
            className="text-xs rounded-full bg-gradient-to-r from-amber-500 to-red-500 text-white font-medium shadow-sm hover:opacity-95 gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Weekly Reflection &amp; Stats
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

      {/* --- NEW HERO: COLUMN CHECKLIST PROGRESS (Acads Red • Org Yellow • Work Green) --- */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            My Day Column Momentum (Acads • Org • Work)
          </h2>
          <span className="text-xs font-semibold text-muted-foreground">
            {completedTasks}/{totalTasks} total tasks done
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
                    <span>{completed}/{total} completed</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* --- MAIN METRICS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* 1. Overall Progress Card */}
          <Card className="border border-border bg-card shadow-sm h-[170px] flex flex-col justify-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                SEMESTER MOMENTUM
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${completionRate}%`,
                      backgroundColor: theme.primary,
                    }}
                  />
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                  <span className="text-foreground font-bold text-lg">{completedTasks}</span>{" "}
                  <span>/</span> {tasks.length} tasks completed across all columns
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* 2. Total Tasks */}
            <Card className="border border-border bg-card shadow-sm hover:shadow-md transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  ACTIVE WORKLOAD
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-4xl font-black text-foreground">{tasks.length}</div>
                <div className="space-y-2">
                  <p className="text-xs font-bold" style={{ color: theme.primary }}>Status Check</p>
                  <div className="flex gap-2 text-xs font-medium">
                    <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-md">
                      {completedTasks} Done
                    </span>
                    <span className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 rounded-md">
                      {upcomingTasks.length} Pending
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3. Today's Events */}
            <Card className="border border-border bg-card shadow-sm hover:shadow-md transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  DAILY AGENDA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-4xl font-black text-foreground">{todayEvents.length}</div>
                <div className="space-y-2">
                  <p className="text-xs font-bold" style={{ color: theme.primary }}>Up Next</p>
                  <div className="text-xs space-y-1 font-medium">
                    {todayEvents.length > 0 ? (
                      <>
                        <div style={{ color: theme.secondary }}>{format(new Date(todayEvents[0].date), "h:mm a")}</div>
                        <div className="text-foreground truncate">{todayEvents[0].title}</div>
                      </>
                    ) : (
                      <div className="italic text-muted-foreground">Clear schedule today</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 4. Monthly Velocity */}
          <Card className="border border-border bg-card shadow-sm h-[170px] flex flex-col justify-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                MONTHLY VELOCITY
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${thisMonthRate}%`,
                      backgroundColor: theme.secondary,
                    }}
                  />
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                  {thisMonthCompleted} completed this month
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- RIGHT COLUMN: CHARTS --- */}
        <div className="space-y-6">
          {/* Chart 1: Urgency */}
          <Card className="border border-border bg-card shadow-sm flex flex-col h-[350px]">
            <CardHeader className="pb-0">
              <CardTitle className="text-base text-foreground font-bold">Priority Matrix</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Tasks distribution by urgency</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-[200px] relative flex flex-col items-center justify-center pb-8">
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mb-12">
                <span className="text-4xl font-black text-foreground tracking-tight">{totalTasks}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-0.5">Total</span>
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
              <div className="flex justify-center gap-4 mt-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                  <span className="text-xs text-muted-foreground font-medium">Critical</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                  <span className="text-xs text-muted-foreground font-medium">Moderate</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span className="text-xs text-muted-foreground font-medium">Minor</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chart 2: Category */}
          <Card className="border border-border bg-card shadow-sm flex flex-col h-[350px]">
            <CardHeader className="pb-0">
              <CardTitle className="text-base text-foreground font-bold">Focus Distribution</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Where your energy goes</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-[200px] relative flex flex-col items-center justify-center pb-8">
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mb-12">
                <span className="text-4xl font-black text-foreground tracking-tight">{totalTasks}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-0.5">Total</span>
              </div>
              <div className="h-[170px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData.length > 0 ? categoryData : emptyData}
                      cx="50%" cy="50%" innerRadius={50} outerRadius={70}
                      paddingAngle={5} dataKey="value" stroke="none" cornerRadius={5}
                    >
                      {(categoryData.length > 0 ? categoryData : emptyData).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity cursor-pointer" />
                      ))}
                    </Pie>
                    {categoryData.length > 0 && <Tooltip content={<CustomTooltip />} />}
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-2 px-2">
                {categoryData.slice(0, 4).map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-muted-foreground font-medium truncate max-w-[80px]">
                      {item.name.replace("Subject", "")}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* --- BOTTOM SECTION: LISTS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tasks */}
        <Card className="border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-foreground text-base font-bold flex items-center gap-2">
              Upcoming Tasks
            </CardTitle>
            <CardDescription className="text-muted-foreground text-xs">
              {upcomingTasks.length} pending tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map((task: any) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-secondary/60 transition-all border border-border"
                  >
                    <div
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 ${
                        task.urgency === "critical"
                          ? "bg-red-500 shadow-red-500/50 shadow-xs"
                          : task.urgency === "moderate"
                          ? "bg-amber-500 shadow-amber-500/50 shadow-xs"
                          : "bg-emerald-500 shadow-emerald-500/50 shadow-xs"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground line-clamp-1">{task.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap font-medium">
                        <span className="bg-secondary px-2 py-0.5 rounded border border-border">
                          {task.subject}
                        </span>
                        <span style={{ color: theme.primary }}>{format(new Date(task.dueDate), "MMM d")}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <CheckCircle2 className="w-10 h-10 mb-2 opacity-30 text-emerald-500" />
                  <p className="text-sm font-semibold">All caught up! You&apos;re crushing it. 🚀</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Today's Events */}
        <Card className="border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-foreground text-base font-bold flex items-center gap-2">
              Today&apos;s Schedule
            </CardTitle>
            <CardDescription className="text-muted-foreground text-xs">
              {todayEvents.length} events scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
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
                  <p className="text-sm font-semibold">Clear schedule today. Time for deep work? 🧠</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <WeeklyReflectionModal
        isOpen={isReflectionOpen}
        onClose={() => setIsReflectionOpen(false)}
        tasks={tasks}
        columns={columns}
      />
    </div>
  )
}