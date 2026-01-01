"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Task {
  id: string
  title: string
  subject: string
  completed: boolean
}

interface ProgressTrackerProps {
  tasks: Task[]
}

export function ProgressTracker({ tasks = [] }: ProgressTrackerProps) {
  const subjects = Array.from(new Set(tasks.map((t) => t.subject)))

  const getSubjectProgress = (subject: string) => {
    const subjectTasks = tasks.filter((t) => t.subject === subject)
    if (subjectTasks.length === 0) return 0
    const completed = subjectTasks.filter((t) => t.completed).length
    return (completed / subjectTasks.length) * 100
  }

  const totalProgress = tasks.length > 0 ? (tasks.filter((t) => t.completed).length / tasks.length) * 100 : 0

  const getProgressGradient = (progress: number) => {
    if (progress === 0) return "from-slate-500 to-slate-600"
    if (progress < 33) return "from-red-400 to-orange-400"
    if (progress < 66) return "from-yellow-400 to-orange-400"
    return "from-green-400 to-emerald-400"
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400 bg-clip-text text-transparent">
          Progress Tracker
        </h1>
        <p className="text-muted-foreground mt-2">Monitor your semester progress across all subjects</p>
      </div>

      <Card className="border-2 border-transparent bg-gradient-to-br from-purple-500/10 to-blue-500/10 hover:border-purple-500/50 transition-all duration-300">
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
          <CardDescription>All subjects combined</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative h-4 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getProgressGradient(totalProgress)} rounded-full transition-all duration-700 shadow-lg shadow-purple-500/50`}
              style={{ width: `${totalProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {tasks.filter((t) => t.completed).length} of {tasks.length} tasks completed
            </span>
            <span className="font-semibold text-purple-400">{Math.round(totalProgress)}%</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subjects.length > 0 ? (
          subjects.map((subject) => {
            const subjectTasks = tasks.filter((t) => t.subject === subject)
            const progress = getSubjectProgress(subject)
            const completed = subjectTasks.filter((t) => t.completed).length

            return (
              <Card
                key={subject}
                className={`border-2 border-transparent transition-all duration-300 hover:border-blue-500/50 ${
                  progress === 100
                    ? "bg-gradient-to-br from-green-500/10 to-emerald-500/10"
                    : progress > 50
                      ? "bg-gradient-to-br from-yellow-500/10 to-orange-500/10"
                      : "bg-gradient-to-br from-red-500/10 to-orange-500/10"
                }`}
              >
                <CardHeader>
                  <CardTitle className="text-base">{subject}</CardTitle>
                  <CardDescription>
                    {completed} of {subjectTasks.length} tasks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="relative h-3 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${getProgressGradient(progress)} rounded-full transition-all duration-700`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-sm font-medium text-right text-blue-400">{Math.round(progress)}%</div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card className="md:col-span-2">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Create tasks to track your progress by subject</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
