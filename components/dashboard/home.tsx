"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { CheckCircle2, CalendarOff, Palette } from "lucide-react"


const THEMES: Record<string, any> = {
  ocean: {
    label: "Ocean",
    primary: "#06b6d4", 
    secondary: "#3b82f6", 
    gradient: "from-cyan-950/40 via-slate-900 to-slate-950",
    activeBorder: "border-cyan-500/30",
    textTitle: "text-cyan-400",
    textSub: "text-cyan-100",
    progress: "bg-cyan-500",
    shadowColor: "rgba(6,182,212,0.5)",
    chartColors: ["#06b6d4", "#3b82f6", "#0ea5e9", "#6366f1", "#8b5cf6"],
  },
  berry: {
    label: "Berry",
    primary: "#ec4899", 
    secondary: "#d946ef",
    gradient: "from-pink-950/40 via-slate-900 to-slate-950",
    activeBorder: "border-pink-500/30",
    textTitle: "text-pink-400",
    textSub: "text-pink-100",
    progress: "bg-pink-500",
    shadowColor: "rgba(236,72,153,0.5)",
    chartColors: ["#ec4899", "#d946ef", "#be185d", "#a21caf", "#fb7185"],
  },
  forest: {
    label: "Forest",
    primary: "#10b981", 
    secondary: "#22c55e", 
    gradient: "from-emerald-950/40 via-slate-900 to-slate-950",
    activeBorder: "border-emerald-500/30",
    textTitle: "text-emerald-400",
    textSub: "text-emerald-100",
    progress: "bg-emerald-500",
    shadowColor: "rgba(16,185,129,0.5)",
    chartColors: ["#10b981", "#34d399", "#059669", "#84cc16", "#bef264"],
  },
  royal: {
    label: "Royal",
    primary: "#8b5cf6", 
    secondary: "#a855f7", 
    gradient: "from-violet-950/40 via-slate-900 to-slate-950",
    activeBorder: "border-violet-500/30",
    textTitle: "text-violet-400",
    textSub: "text-violet-100",
    progress: "bg-violet-500",
    shadowColor: "rgba(139,92,246,0.5)",
    chartColors: ["#8b5cf6", "#a855f7", "#7c3aed", "#6366f1", "#c084fc"],
  },
  sunset: {
    label: "Sunset",
    primary: "#f97316", 
    secondary: "#f59e0b", 
    gradient: "from-orange-950/40 via-slate-900 to-slate-950",
    activeBorder: "border-orange-500/30",
    textTitle: "text-orange-400",
    textSub: "text-orange-100",
    progress: "bg-orange-500",
    shadowColor: "rgba(249,115,22,0.5)",
    chartColors: ["#f97316", "#f59e0b", "#ea580c", "#d97706", "#fbbf24"],
  },
}

interface HomeProps {
  tasks: any[]
  events: any[]
  notes: any[]
}

// Custom Tooltip Component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-slate-950/90 border border-slate-800 p-3 rounded-xl shadow-2xl backdrop-blur-md z-50">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: data.color }} />
          <p className="text-white text-base font-semibold">{data.name}</p>
        </div>
        <p className="text-sm text-slate-400 pl-6">
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
  
 
  const theme = THEMES[themeKey] || THEMES.ocean

  
  const completedTasks = tasks.filter((t: any) => t.completed).length
  const completionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0

  const todayEvents = events.filter((e: any) => {
    const eventDate = new Date(e.date).toDateString()
    return eventDate === new Date().toDateString()
  })

  const upcomingTasks = tasks
    .filter((t: any) => !t.completed)
    .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5)

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const thisMonthTasks = tasks.filter((t: any) => {
    const taskDate = new Date(t.dueDate)
    return taskDate.getMonth() === currentMonth && taskDate.getFullYear() === currentYear
  })
  const thisMonthCompleted = thisMonthTasks.filter((t: any) => t.completed).length
  const thisMonthRate = thisMonthTasks.length > 0 ? (thisMonthCompleted / thisMonthTasks.length) * 100 : 0

 
  const urgencyData = useMemo(() => [
    { name: "Critical", value: tasks.filter((t: any) => t.urgency === "critical").length, color: "#ef4444" },
    { name: "Moderate", value: tasks.filter((t: any) => t.urgency === "moderate").length, color: "#f59e0b" },
    { name: "Minor", value: tasks.filter((t: any) => t.urgency === "minor").length, color: "#10b981" },
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
      value: tasks.filter((t: any) => t.category === cat.id).length,
      // Cycle through theme chart colors
      color: theme.chartColors[index % theme.chartColors.length]
    })).filter((item) => item.value > 0)
  }, [tasks, theme])

  const totalTasks = tasks.length
  const emptyData = [{ name: "No Data", value: 1, color: "#1e293b" }]

  return (
    <div className="relative min-h-screen space-y-6 animate-in fade-in duration-500 p-1">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {getGreeting()}, <span style={{ color: theme.primary }}>{username}</span>
          </h1>
          <p className="text-slate-400 mt-1 font-mono text-xl">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
        </div>

        {/* Theme Selector */}
        <div className="flex items-center gap-3 bg-slate-900/50 p-2 rounded-lg border border-slate-800">
          <Palette className="w-4 h-4 text-slate-400" />
          <div className="flex gap-1">
            {Object.keys(THEMES).map((key) => (
              <button
                key={key}
                onClick={() => setThemeKey(key)}
                className={`w-6 h-6 rounded-full border transition-all ${
                  themeKey === key ? "border-white scale-110" : "border-transparent opacity-50 hover:opacity-100"
                }`}
                style={{ backgroundColor: THEMES[key].primary }}
                title={THEMES[key].label}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- LEFT COLUMN: METRICS --- */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* 1. Overall Progress */}
          <Card className={`border border-white/10 shadow-xl h-[180px] flex flex-col justify-center bg-gradient-to-br ${theme.gradient}`}>
            <CardHeader className="pb-2">
              <CardTitle className={`text-sm font-medium font-mono tracking-wider ${theme.textTitle}`}>
                SEMESTER MOMENTUM
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative h-3 bg-slate-950/50 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ 
                      width: `${completionRate}%`,
                      backgroundColor: theme.primary,
                      boxShadow: `0 0 15px ${theme.shadowColor}`
                    }}
                  />
                </div>
                <p className="text-base text-slate-300">
                  <span className="text-white font-bold text-lg">{completedTasks}</span>{" "}
                  <span className="text-slate-500">/</span> {tasks.length} tasks completed
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-6">
            
            {/* 2. Total Tasks */}
            <Card className={`border border-white/10 bg-gradient-to-br ${theme.gradient} hover:border-white/20 transition-all duration-300 shadow-xl`}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-sm font-medium font-mono ${theme.textTitle}`}>ACTIVE WORKLOAD</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-5xl font-bold text-white">{tasks.length}</div>
                <div className="space-y-2">
                  <p className="text-xs font-medium opacity-80" style={{ color: theme.primary }}>Status Check</p>
                  <div className="flex gap-2 text-xs">
                    <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded">
                      {completedTasks} Done
                    </span>
                    <span className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded">
                      {upcomingTasks.length} Pending
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3. Today's Events */}
            <Card className={`border border-white/10 bg-gradient-to-br ${theme.gradient} hover:border-white/20 transition-all duration-300 shadow-xl`}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-sm font-medium font-mono ${theme.textTitle}`}>DAILY AGENDA</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-5xl font-bold text-white">{todayEvents.length}</div>
                <div className="space-y-2">
                  <p className="text-xs font-medium opacity-80" style={{ color: theme.primary }}>Up Next</p>
                  <div className="text-xs space-y-1 opacity-90">
                    {todayEvents.length > 0 ? (
                      <>
                        <div style={{ color: theme.secondary }}>{format(new Date(todayEvents[0].date), "h:mm a")}</div>
                        <div className="text-slate-200 truncate">{todayEvents[0].title}</div>
                      </>
                    ) : (
                      <div className="italic text-slate-500">Clear schedule today</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 4. Monthly Velocity */}
          <Card className={`border border-white/10 bg-gradient-to-br ${theme.gradient} shadow-xl h-[180px] flex flex-col justify-center`}>
            <CardHeader className="pb-2">
              <CardTitle className={`text-sm font-medium font-mono ${theme.textTitle}`}>MONTHLY VELOCITY</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative h-3 bg-slate-950/50 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ 
                      width: `${thisMonthRate}%`,
                      backgroundColor: theme.secondary,
                      boxShadow: `0 0 10px ${theme.shadowColor}`
                    }}
                  />
                </div>
                <p className="text-base text-slate-300">{thisMonthCompleted} completed this month</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- RIGHT COLUMN: CHARTS --- */}
        <div className="space-y-6">
          
          {/* Chart 1: Urgency (Semantic Colors) */}
          <Card className={`border border-white/10 bg-gradient-to-br ${theme.gradient} shadow-xl flex flex-col h-[360px]`}>
            <CardHeader className="pb-0">
              <CardTitle className="text-lg text-white font-medium">Priority Matrix</CardTitle>
              <CardDescription className="text-slate-400 text-sm">Tasks distribution by urgency</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-[220px] relative flex flex-col items-center justify-center pb-10">
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mb-18">
                <span className="text-5xl font-bold text-white tracking-tighter">{totalTasks}</span>
                <span className="text-sm text-slate-500 uppercase tracking-widest font-bold mt-1">Total</span>
              </div>
              <div className="h-[180px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={urgencyData.length > 0 ? urgencyData : emptyData}
                      cx="50%" cy="50%" innerRadius={55} outerRadius={75}
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
              {/* Legend */}
              <div className="flex justify-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div><span className="text-sm text-slate-300">Critical</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div><span className="text-sm text-slate-300">Moderate</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div><span className="text-sm text-slate-300">Minor</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chart 2: Category (Themed Colors) */}
          <Card className={`border border-white/10 bg-gradient-to-br ${theme.gradient} shadow-xl flex flex-col h-[360px]`}>
            <CardHeader className="pb-0">
              <CardTitle className="text-lg text-white font-medium">Focus Distribution</CardTitle>
              <CardDescription className="text-slate-400 text-sm">Where your energy goes</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-[220px] relative flex flex-col items-center justify-center pb-10">
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mb-18">
                <span className="text-5xl font-bold text-white tracking-tighter">{totalTasks}</span>
                <span className="text-sm text-slate-500 uppercase tracking-widest font-bold mt-1">Total</span>
              </div>
              <div className="h-[180px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData.length > 0 ? categoryData : emptyData}
                      cx="50%" cy="50%" innerRadius={55} outerRadius={75}
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
              <div className="flex flex-wrap justify-center gap-3 mt-4 px-2">
                {categoryData.slice(0, 4).map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-slate-300 truncate max-w-[80px]">
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
        <Card className={`border border-white/10 bg-gradient-to-br from-[#18181b] to-[#09090b] shadow-xl hover:${theme.activeBorder} transition-colors group`}>
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
               Upcoming Tasks
               <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-transparent group-hover:from-transparent group-hover:via-white/20 transition-all" />
            </CardTitle>
            <CardDescription className="text-slate-500 text-xs mt-1">
              {upcomingTasks.length} pending tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map((task: any) => (
                  <div
                    key={task.id}
                    className={`flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-all border border-transparent hover:${theme.activeBorder} group/item cursor-pointer`}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${
                      task.urgency === "critical" ? "bg-red-500 shadow-red-500/50 shadow-md"
                      : task.urgency === "moderate" ? "bg-amber-500 shadow-amber-500/50 shadow-md"
                      : "bg-emerald-500 shadow-emerald-500/50 shadow-md"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm line-clamp-1 ${theme.textSub}`}>{task.title}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 flex-wrap">
                        <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-slate-300">
                          {task.subject}
                        </span>
                        <span style={{ color: theme.primary }}>{format(new Date(task.dueDate), "MMM d")}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                    <CheckCircle2 className="w-10 h-10 mb-2 opacity-20" />
                    <p className="text-sm">All caught up! You're crushing it. 🚀</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Today's Events */}
        <Card className={`border border-white/10 bg-gradient-to-br from-[#18181b] to-[#09090b] shadow-xl hover:${theme.activeBorder} transition-colors group`}>
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              Today's Schedule
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-transparent group-hover:from-transparent group-hover:via-white/20 transition-all" />
            </CardTitle>
            <CardDescription className="text-slate-500 text-xs mt-1">
              {todayEvents.length} events scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {todayEvents.length > 0 ? (
                todayEvents
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((event: any) => (
                    <div
                      key={event.id}
                      className={`p-3 rounded-lg hover:bg-white/5 transition-all border border-transparent hover:${theme.activeBorder} cursor-pointer`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className={`font-semibold text-sm line-clamp-1 ${theme.textSub}`}>{event.title}</p>
                          <p className="text-xs font-mono mt-1 opacity-80" style={{ color: theme.secondary }}>
                            {format(new Date(event.date), "h:mm a")}
                          </p>
                          {event.description && (
                            <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{event.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                    <CalendarOff className="w-10 h-10 mb-2 opacity-20" />
                    <p className="text-sm">Clear schedule. Time for deep work? 🧠</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}