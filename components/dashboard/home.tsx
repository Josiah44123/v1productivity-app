"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useSession } from "next-auth/react"

interface HomeProps {
  tasks: any[]
  events: any[]
  notes: any[]
}

export function DashboardHome({ tasks = [], events = [], notes = [] }: HomeProps) {
  const { data: session } = useSession()
  const name = session?.user?.name || "User"
  
  const completedTasks = tasks.filter((t) => t.completed).length
  const totalTasks = tasks.length
  
  const upcomingTasks = tasks
    .filter((t) => !t.completed)
    .sort((a, b) => {
      const p: Record<string, number> = { high: 0, medium: 1, low: 2 }
      return p[a.priority] - p[b.priority]
    })
    .slice(0, 5)

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {getGreeting()}, <span className="text-blue-600 dark:text-blue-400">{name}</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Here is an overview of your productivity today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase text-gray-500 font-semibold tracking-wider">
              Total Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900 dark:text-white">{totalTasks}</div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase text-gray-500 font-semibold tracking-wider">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">{completedTasks}</div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase text-gray-500 font-semibold tracking-wider">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-amber-600 dark:text-amber-400">{totalTasks - completedTasks}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Top Priorities</CardTitle>
            <CardDescription>Your most important pending tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map((task: any) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-700">
                    <span className="font-medium text-gray-900 dark:text-white">{task.title}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium
                      ${task.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : ''}
                      ${task.priority === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : ''}
                      ${task.priority === 'low' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                    `}>
                      {task.priority}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No pending tasks!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}