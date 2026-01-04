"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface HomeProps {
  tasks: any[]
  events: any[]
  notes: any[]
}

// Custom Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-slate-950/90 border border-slate-800 p-3 rounded-xl shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
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
  // 1. CONNECT TO LOCAL STORAGE FOR DYNAMIC NAME
  const [username] = useLocalStorage("user-name", "Josiah")

  // --- METRICS CALCULATIONS ---
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

  // --- CHART 1 DATA: URGENCY ---
  const urgencyData = [
    { name: "Critical", value: tasks.filter((t: any) => t.urgency === "critical").length, color: "#ef4444" },
    { name: "Moderate", value: tasks.filter((t: any) => t.urgency === "moderate").length, color: "#f59e0b" },
    { name: "Minor", value: tasks.filter((t: any) => t.urgency === "minor").length, color: "#10b981" },
  ].filter((item) => item.value > 0)

  // --- CHART 2 DATA: CATEGORY ---
  const categoryData = [
    { name: "Major Subject", value: tasks.filter((t: any) => t.category === "major-subject").length, color: "#3b82f6" },
    { name: "Minor Subject", value: tasks.filter((t: any) => t.category === "minor-subject").length, color: "#06b6d4" },
    { name: "Hobby", value: tasks.filter((t: any) => t.category === "hobby").length, color: "#ec4899" },
    {
      name: "Extracurricular",
      value: tasks.filter((t: any) => t.category === "extracurricular").length,
      color: "#8b5cf6",
    },
    { name: "Organization", value: tasks.filter((t: any) => t.category === "organization").length, color: "#f97316" },
  ].filter((item) => item.value > 0)

  const totalTasks = tasks.length
  const emptyData = [{ name: "No Data", value: 1, color: "#1e293b" }]

  return (
    <div className="relative min-h-screen space-y-6 animate-in fade-in duration-500 p-1">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          {getGreeting()}, <span className="text-cyan-400">{username}</span>
        </h1>
        <p className="text-slate-400 mt-1 font-mono text-sm">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: METRICS */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Overall Progress - DEEP INDIGO GRADIENT */}
          <Card className="border-0 bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#1e1b4b] shadow-xl h-[180px] flex flex-col justify-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-cyan-400 font-mono tracking-wider">
                OVERALL PROGRESS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative h-3 bg-slate-950/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.8)] rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${completionRate}%` }}
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
            {/* Total Tasks - DEEP ORANGE/BROWN GRADIENT */}
            <Card className="border-2 border-cyan-500/40 bg-gradient-to-br from-[#0f172a] to-[#020617] hover:from-[#1a2847] transition-colors shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-cyan-300 font-mono">TOTAL TASKS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-5xl font-bold text-white">{tasks.length}</div>
                <div className="space-y-2">
                  <p className="text-xs text-cyan-400/80 font-medium">By Status</p>
                  <div className="flex gap-2 text-xs">
                    <span className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded">
                      {completedTasks} Done
                    </span>
                    <span className="px-2 py-1 bg-orange-500/20 border border-orange-500/30 text-orange-300 rounded">
                      {upcomingTasks.length} Pending
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Today's Events - DEEP ROSE/PINK GRADIENT */}
            <Card className="border-2 border-pink-500/40 bg-gradient-to-br from-[#1a0a1a] to-[#020617] hover:from-[#2a1a2a] transition-colors shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-pink-300 font-mono">TODAY'S EVENTS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-5xl font-bold text-white">{todayEvents.length}</div>
                <div className="space-y-2">
                  <p className="text-xs text-pink-400/80 font-medium">Time Slots</p>
                  <div className="text-xs text-pink-400/70 space-y-1">
                    {todayEvents.length > 0 ? (
                      <>
                        <div>Next: {format(new Date(todayEvents[0].date), "h:mm a")}</div>
                        <div className="text-pink-300">{todayEvents[0].title}</div>
                      </>
                    ) : (
                      <div>No events scheduled</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Progress - DEEP CYAN/BLUE GRADIENT */}
          <Card className="border-0 bg-gradient-to-br from-[#083344] to-[#020617] shadow-xl h-[180px] flex flex-col justify-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-sky-400 font-mono">MONTHLY TARGET</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative h-3 bg-slate-950/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${thisMonthRate}%` }}
                  />
                </div>
                <p className="text-base text-slate-300">{thisMonthCompleted} completed this month</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: CHARTS */}
        <div className="space-y-6">
          {/* CHART 1: URGENCY - DEEP SLATE GRADIENT */}
          <Card className="border-0 bg-gradient-to-br from-[#0f172a] to-[#020617] shadow-xl flex flex-col h-[360px]">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg text-white font-medium">Urgency Breakdown</CardTitle>
              <CardDescription className="text-slate-400 text-sm">Tasks by priority level</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-[220px] relative flex flex-col items-center justify-center pb-10">
              {/* Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mb-18">
                <span className="text-5xl font-bold text-white tracking-tighter">{totalTasks}</span>
                <span className="text-sm text-slate-500 uppercase tracking-widest font-bold mt-1">Total</span>
              </div>

              {/* Chart */}
              <div className="h-[180px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={urgencyData.length > 0 ? urgencyData : emptyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                      cornerRadius={5}
                    >
                      {(urgencyData.length > 0 ? urgencyData : emptyData).map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          className="hover:opacity-80 transition-opacity cursor-pointer"
                        />
                      ))}
                    </Pie>
                    {urgencyData.length > 0 && <Tooltip content={<CustomTooltip />} />}
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="flex justify-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                  <span className="text-sm text-slate-300">Critical</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                  <span className="text-sm text-slate-300">Moderate</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span className="text-sm text-slate-300">Minor</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CHART 2: CATEGORY - DEEP VIOLET GRADIENT */}
          <Card className="border-0 bg-gradient-to-br from-[#2e1065] to-[#020617] shadow-xl flex flex-col h-[360px]">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg text-white font-medium">Category Split</CardTitle>
              <CardDescription className="text-slate-400 text-sm">Distribution by type</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-[220px] relative flex flex-col items-center justify-center pb-10">
              {/* Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mb-18">
                <span className="text-5xl font-bold text-white tracking-tighter">{totalTasks}</span>
                <span className="text-sm text-slate-500 uppercase tracking-widest font-bold mt-1">Total</span>
              </div>

              {/* Chart */}
              <div className="h-[180px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData.length > 0 ? categoryData : emptyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                      cornerRadius={5}
                    >
                      {(categoryData.length > 0 ? categoryData : emptyData).map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          className="hover:opacity-80 transition-opacity cursor-pointer"
                        />
                      ))}
                    </Pie>
                    {categoryData.length > 0 && <Tooltip content={<CustomTooltip />} />}
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
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

      {/* Bottom Section: Task List & Notes - DEEP ZINC GRADIENT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tasks */}
        <Card className="border-2 border-cyan-500/40 bg-gradient-to-br from-[#18181b] to-[#09090b] shadow-xl hover:border-cyan-500/60 transition-colors">
          <CardHeader>
            <CardTitle className="text-white text-lg bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Upcoming Tasks
            </CardTitle>
            <CardDescription className="text-slate-500 text-xs mt-1">
              {upcomingTasks.length} pending tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map((task: any) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-all border-2 border-cyan-500/20 hover:border-cyan-500/40 group cursor-pointer"
                  >
                    <div
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${
                        task.urgency === "critical"
                          ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)]"
                          : task.urgency === "moderate"
                            ? "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,1)]"
                            : "bg-emerald-500 shadow-[0_0_10px_rgba(34,197,94,1)]"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-cyan-100 line-clamp-1">{task.title}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 flex-wrap">
                        <span className="bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/30 text-cyan-300">
                          {task.subject}
                        </span>
                        <span className="text-cyan-400/70">{format(new Date(task.dueDate), "MMM d")}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 italic p-4 text-center">No pending tasks</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Today's Events */}
        <Card className="border-2 border-pink-500/40 bg-gradient-to-br from-[#18181b] to-[#09090b] shadow-xl hover:border-pink-500/60 transition-colors">
          <CardHeader>
            <CardTitle className="text-white text-lg bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
              Today's Schedule
            </CardTitle>
            <CardDescription className="text-slate-500 text-xs mt-1">
              {todayEvents.length} events scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {todayEvents.length > 0 ? (
                todayEvents
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((event: any) => (
                    <div
                      key={event.id}
                      className="p-3 rounded-lg hover:bg-white/5 transition-all border-2 border-pink-500/20 hover:border-pink-500/40 group cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-pink-100 line-clamp-1">{event.title}</p>
                          <p className="text-xs text-pink-400/80 font-mono mt-1">
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
                <p className="text-sm text-slate-500 italic p-4 text-center">No events scheduled</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}