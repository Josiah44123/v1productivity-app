"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

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
          {data.value} {data.value === 1 ? 'task' : 'tasks'}
        </p>
      </div>
    )
  }
  return null
}

export function DashboardHome({ tasks = [], events = [], notes = [] }: HomeProps) {
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
    { name: "Extracurricular", value: tasks.filter((t: any) => t.category === "extracurricular").length, color: "#8b5cf6" },
    { name: "Organization", value: tasks.filter((t: any) => t.category === "organization").length, color: "#f97316" },
  ].filter((item) => item.value > 0)

  const totalTasks = tasks.length
  const emptyData = [{ name: "No Data", value: 1, color: "#1e293b" }]

  return (
    <div className="relative min-h-screen space-y-6 animate-in fade-in duration-500 p-1">
      
   
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          {getGreeting()}, <span className="text-cyan-400">Josiah</span>
        </h1>
        <p className="text-slate-400 mt-1 font-mono text-sm">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: METRICS */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Overall Progress - DEEP INDIGO GRADIENT */}
          <Card className="border-0 bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#1e1b4b] shadow-xl h-[180px] flex flex-col justify-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-cyan-400 font-mono tracking-wider">OVERALL PROGRESS</CardTitle>
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
                  <span className="text-white font-bold text-lg">{completedTasks}</span> <span className="text-slate-500">/</span> {tasks.length} tasks completed
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-6">
            
            {/* Total Tasks - DEEP ORANGE/BROWN GRADIENT */}
            <Card className="border-0 bg-gradient-to-br from-[#431407] to-[#1c1917] hover:from-[#5c1c0a] transition-colors shadow-xl h-[280px] flex flex-col justify-between">
              <CardHeader className="pb-0 pt-8">
                <CardTitle className="text-base font-medium text-orange-200/70 font-mono">TOTAL TASKS</CardTitle>
              </CardHeader>
              <CardContent className="pb-10">
                <div className="text-7xl font-bold text-white mb-2">{tasks.length}</div>
                <p className="text-sm text-orange-400/80">{upcomingTasks.length} pending</p>
              </CardContent>
            </Card>

            {/* Today's Events - DEEP ROSE/PINK GRADIENT */}
            <Card className="border-0 bg-gradient-to-br from-[#500724] to-[#1c1917] hover:from-[#6d0a31] transition-colors shadow-xl h-[280px] flex flex-col justify-between">
              <CardHeader className="pb-0 pt-8">
                <CardTitle className="text-base font-medium text-pink-200/70 font-mono">EVENTS TODAY</CardTitle>
              </CardHeader>
              <CardContent className="pb-10">
                <div className="text-7xl font-bold text-white mb-2">{todayEvents.length}</div>
                <p className="text-sm text-pink-400/80">scheduled</p>
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
                <p className="text-base text-slate-300">
                  {thisMonthCompleted} completed this month
                </p>
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
                        <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity cursor-pointer"/>
                      ))}
                    </Pie>
                    {urgencyData.length > 0 && <Tooltip content={<CustomTooltip />} />}
                  </PieChart>
                </ResponsiveContainer>
               </div>

              {/* Legend */}
              <div className="flex justify-center gap-4 mt-4">
                 <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div><span className="text-sm text-slate-300">Critical</span></div>
                 <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div><span className="text-sm text-slate-300">Moderate</span></div>
                 <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div><span className="text-sm text-slate-300">Minor</span></div>
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
                        <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity cursor-pointer"/>
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
                    <span className="text-sm text-slate-300 truncate max-w-[80px]">{item.name.replace('Subject', '')}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Bottom Section: Task List & Notes - DEEP ZINC GRADIENT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 bg-gradient-to-br from-[#18181b] to-[#09090b] shadow-xl">
          <CardHeader>
            <CardTitle className="text-white text-lg">Upcoming Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map((task: any) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
                  >
                    <div className={`w-2 h-2 rounded-full ${
                        task.urgency === "critical" ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1)]" : 
                        task.urgency === "moderate" ? "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,1)]" : 
                        "bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,1)]"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-200 truncate">{task.title}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="text-cyan-500/70">{task.subject}</span>
                        <span className="text-slate-700">•</span>
                        <span>{format(new Date(task.dueDate), "MMM d")}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 italic p-2">No pending tasks</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-[#18181b] to-[#09090b] shadow-xl">
          <CardHeader>
            <CardTitle className="text-white text-lg">Recent Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {notes.length > 0 ? (
                notes.slice(0, 5).map((note: any) => (
                  <div key={note.id} className="p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                    <p className="font-medium text-sm text-slate-200">{note.title}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{note.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 italic p-2">No notes yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}