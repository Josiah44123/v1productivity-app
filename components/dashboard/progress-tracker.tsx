"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Award, TrendingUp, Calendar, Star, CheckCircle2, BookOpen } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { WeeklyReflectionModal, type Column, type Task } from "./weekly-reflection-modal"

interface ProgressTrackerProps {
  tasks: Task[]
}

const DEFAULT_COLUMNS: Column[] = [
  { id: "acads", title: "Acads", colorTheme: "red" },
  { id: "org", title: "Org", colorTheme: "yellow" },
  { id: "work", title: "Work", colorTheme: "green" },
]

export function ProgressTracker({ tasks = [] }: ProgressTrackerProps) {
  const [columns] = useLocalStorage<Column[]>("task_columns", DEFAULT_COLUMNS)
  const [reflections] = useLocalStorage<any[]>("weekly_reflections", [])
  const [isReflectionOpen, setIsReflectionOpen] = useState(false)

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

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.completed).length
  const totalProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  const getColColorClass = (theme: string) => {
    switch (theme) {
      case "red":
        return {
          bar: "bg-red-500",
          cardBg: "bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900",
          text: "text-red-600 dark:text-red-400",
          badge: "bg-red-500 text-white",
        }
      case "yellow":
        return {
          bar: "bg-amber-500",
          cardBg: "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900",
          text: "text-amber-600 dark:text-amber-400",
          badge: "bg-amber-500 text-white",
        }
      case "green":
        return {
          bar: "bg-emerald-500",
          cardBg: "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900",
          text: "text-emerald-600 dark:text-emerald-400",
          badge: "bg-emerald-500 text-white",
        }
      case "blue":
        return {
          bar: "bg-blue-500",
          cardBg: "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900",
          text: "text-blue-600 dark:text-blue-400",
          badge: "bg-blue-500 text-white",
        }
      case "purple":
        return {
          bar: "bg-purple-500",
          cardBg: "bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900",
          text: "text-purple-600 dark:text-purple-400",
          badge: "bg-purple-500 text-white",
        }
      default:
        return {
          bar: "bg-slate-500",
          cardBg: "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800",
          text: "text-slate-600 dark:text-slate-400",
          badge: "bg-slate-500 text-white",
        }
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border pb-3">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-amber-600 dark:from-blue-400 dark:via-purple-400 dark:to-amber-400 bg-clip-text text-transparent">
            Progress &amp; Reflection Tracker
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your checklist completion across Acads, Org, and Work &amp; reflect on weekly wins
          </p>
        </div>

        <Button
          onClick={() => setIsReflectionOpen(true)}
          className="text-xs rounded-full bg-gradient-to-r from-amber-500 to-red-500 text-white font-medium shadow-sm hover:opacity-95 gap-1.5"
        >
          <Sparkles className="w-4 h-4" />
          Weekly Reflection Journal
        </Button>
      </div>

      {/* Hero Overall Progress Card */}
      <Card className="border border-border bg-card shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-foreground">Overall Semester Progress</CardTitle>
              <CardDescription className="text-xs">All tasks &amp; checklists combined</CardDescription>
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {Math.round(totalProgress)}%
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-500 rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground font-medium">
            <span>
              {completedTasks} of {totalTasks} tasks completed
            </span>
            <span>{totalTasks - completedTasks} remaining</span>
          </div>
        </CardContent>
      </Card>

      {/* Column Breakdown Cards: Acads (Red), Org (Yellow), Work (Green) */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          Progress by Column
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map((col) => {
            const colTasks = tasks.filter((t) => getTaskColumnId(t) === col.id)
            const completed = colTasks.filter((t) => t.completed).length
            const total = colTasks.length
            const progress = total > 0 ? (completed / total) * 100 : 0
            const styles = getColColorClass(col.colorTheme)

            return (
              <Card
                key={col.id}
                className={`border transition-all duration-300 hover:shadow-md ${styles.cardBg}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full ${styles.badge}`}>
                      {col.title}
                    </span>
                    <span className={`text-lg font-black ${styles.text}`}>
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <CardDescription className="text-xs pt-1">
                    {completed} of {total} tasks completed
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="relative h-2.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${styles.bar} rounded-full transition-all duration-700`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Weekly Reflections History Preview */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-500" />
            Weekly Reflection Logs
          </h2>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsReflectionOpen(true)}
            className="text-xs text-blue-600 dark:text-blue-400 font-medium"
          >
            Open Full Journal →
          </Button>
        </div>

        {reflections.length === 0 ? (
          <Card className="border border-dashed border-border bg-card/60">
            <CardContent className="py-8 text-center space-y-2">
              <Sparkles className="w-8 h-8 text-amber-500 mx-auto opacity-70" />
              <p className="text-sm font-semibold text-foreground">No weekly reflections saved yet</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Every week, reflect on your accomplishments across Acads, Org, and Work to see how you grow!
              </p>
              <Button
                size="sm"
                onClick={() => setIsReflectionOpen(true)}
                className="text-xs bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl mt-2"
              >
                Write My First Reflection
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reflections.slice(0, 4).map((entry: any) => (
              <Card key={entry.id} className="border border-border bg-card shadow-2xs hover:shadow-sm transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-xs font-bold text-foreground">{entry.weekDateRange}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= entry.rating
                              ? "text-amber-400 fill-amber-400"
                              : "text-muted-foreground/20"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-amber-600 dark:text-amber-400">🏆 Wins: </span>
                    <span className="text-foreground/90 line-clamp-2">{entry.wins}</span>
                  </div>
                  <div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">🎯 Goals: </span>
                    <span className="text-foreground/90 line-clamp-1">{entry.nextWeekGoals}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Weekly Reflection Modal */}
      <WeeklyReflectionModal
        isOpen={isReflectionOpen}
        onClose={() => setIsReflectionOpen(false)}
        tasks={tasks}
        columns={columns}
      />
    </div>
  )
}
