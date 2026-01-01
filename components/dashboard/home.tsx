"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"

interface HomeProps {
  tasks: any[]
  events: any[]
  notes: any[]
}

export function DashboardHome({ tasks = [], events = [], notes = [] }: HomeProps) {
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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400 bg-clip-text text-transparent">
          {getGreeting()}, Josiah
        </h1>
        <p className="text-muted-foreground mt-2">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-2 border-transparent bg-gradient-to-br from-blue-500/10 to-purple-500/10 hover:border-blue-500/50 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="relative h-3 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {completedTasks} of {tasks.length} tasks completed
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-transparent bg-gradient-to-br from-orange-500/10 to-red-500/10 hover:border-orange-500/50 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
            <p className="text-sm text-muted-foreground">{upcomingTasks.length} pending</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-transparent bg-gradient-to-br from-purple-500/10 to-pink-500/10 hover:border-purple-500/50 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Today's Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayEvents.length}</div>
            <p className="text-sm text-muted-foreground">scheduled events</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-transparent bg-gradient-to-br from-blue-500/10 to-cyan-500/10 hover:border-blue-500/50 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">This Month's Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="relative h-3 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${thisMonthRate}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {thisMonthCompleted} of {thisMonthTasks.length} tasks this month
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-border/40 hover:border-blue-500/30 transition-all duration-300">
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
            <CardDescription>Next 5 pending tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map((task: any) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{task.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{task.subject}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(task.dueDate), "MMM d, yyyy")}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        task.priority === "high"
                          ? "bg-destructive/10 text-destructive"
                          : task.priority === "medium"
                            ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500"
                            : "bg-green-500/10 text-green-600 dark:text-green-500"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No pending tasks</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/40 hover:border-purple-500/30 transition-all duration-300">
          <CardHeader>
            <CardTitle>Recent Notes</CardTitle>
            <CardDescription>Latest {Math.min(5, notes.length)} notes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notes.length > 0 ? (
                notes.slice(0, 5).map((note: any) => (
                  <div key={note.id} className="pb-3 border-b border-border last:border-0 last:pb-0">
                    <p className="font-medium text-sm">{note.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{note.subject}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{note.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No notes yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
