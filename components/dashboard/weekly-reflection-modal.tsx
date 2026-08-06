"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Sparkles, Star, CheckCircle2, Calendar, Award, BookOpen, History, ArrowRight } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { format, startOfWeek, endOfWeek } from "date-fns"

export interface Task {
  id: string
  title: string
  subject: string
  description?: string
  dueDate: string
  priority: "low" | "medium" | "high"
  urgency: "minor" | "moderate" | "critical"
  category: string
  completed: boolean
  subtasks?: Task[]
  expanded?: boolean
  columnId?: string
}

export interface Column {
  id: string
  title: string
  colorTheme: "red" | "yellow" | "green" | "blue" | "purple" | "orange" | "pink" | "slate"
}

interface WeeklyReflectionModalProps {
  isOpen: boolean
  onClose: () => void
  tasks: Task[]
  columns: Column[]
}

interface WeeklyReflectionEntry {
  id: string
  weekDateRange: string
  createdAt: string
  wins: string
  challenges: string
  nextWeekGoals: string
  rating: number // 1 to 5
  statsSnapshot: {
    totalCompleted: number
    totalTasks: number
    byColumn: {
      columnTitle: string
      completed: number
      total: number
    }[]
  }
}

export function WeeklyReflectionModal({ isOpen, onClose, tasks, columns }: WeeklyReflectionModalProps) {
  const [reflections, setReflections] = useLocalStorage<WeeklyReflectionEntry[]>("weekly_reflections", [])
  const [activeTab, setActiveTab] = useState<"new" | "history">("new")

  // Reflection form state
  const [wins, setWins] = useState("")
  const [challenges, setChallenges] = useState("")
  const [nextWeekGoals, setNextWeekGoals] = useState("")
  const [rating, setRating] = useState(4)
  const [savedSuccess, setSavedSuccess] = useState(false)

  // Current week date string
  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 })
  const dateRangeStr = `${format(weekStart, "MMM d")} – ${format(weekEnd, "MMM d, yyyy")}`

  // Compute column stats
  const totalCompleted = tasks.filter((t) => t.completed).length
  const totalTasks = tasks.length
  const overallPct = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0

  const columnStats = columns.map((col) => {
    const colTasks = tasks.filter((t) => (t.columnId || "acads") === col.id)
    const completed = colTasks.filter((t) => t.completed).length
    const total = colTasks.length
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0
    return { col, completed, total, pct }
  })

  // Helper for progress bar color
  const getColColorClass = (theme: string) => {
    switch (theme) {
      case "red":
        return { bar: "bg-red-500", bg: "bg-red-50 dark:bg-red-950/20", border: "border-red-200 dark:border-red-800", text: "text-red-600 dark:text-red-400" }
      case "yellow":
        return { bar: "bg-amber-500", bg: "bg-amber-50 dark:bg-amber-950/20", border: "border-amber-200 dark:border-amber-800", text: "text-amber-600 dark:text-amber-400" }
      case "green":
        return { bar: "bg-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/20", border: "border-emerald-200 dark:border-emerald-800", text: "text-emerald-600 dark:text-emerald-400" }
      case "blue":
        return { bar: "bg-blue-500", bg: "bg-blue-50 dark:bg-blue-950/20", border: "border-blue-200 dark:border-blue-800", text: "text-blue-600 dark:text-blue-400" }
      case "purple":
        return { bar: "bg-purple-500", bg: "bg-purple-50 dark:bg-purple-950/20", border: "border-purple-200 dark:border-purple-800", text: "text-purple-600 dark:text-purple-400" }
      default:
        return { bar: "bg-slate-500", bg: "bg-slate-50 dark:bg-slate-900", border: "border-slate-200 dark:border-slate-800", text: "text-slate-600 dark:text-slate-400" }
    }
  }

  const handleSaveReflection = () => {
    if (!wins.trim() && !challenges.trim() && !nextWeekGoals.trim()) {
      return
    }

    const newEntry: WeeklyReflectionEntry = {
      id: Date.now().toString(),
      weekDateRange: dateRangeStr,
      createdAt: new Date().toISOString(),
      wins: wins.trim() || "No wins documented.",
      challenges: challenges.trim() || "No challenges noted.",
      nextWeekGoals: nextWeekGoals.trim() || "Continue steady progress.",
      rating,
      statsSnapshot: {
        totalCompleted,
        totalTasks,
        byColumn: columnStats.map((cs) => ({
          columnTitle: cs.col.title,
          completed: cs.completed,
          total: cs.total,
        })),
      },
    }

    setReflections([newEntry, ...reflections])
    setWins("")
    setChallenges("")
    setNextWeekGoals("")
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border shadow-2xl p-6 rounded-2xl">
        <DialogHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-foreground">
                  Weekly Reflection & Progress
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Review your achievements across Acads, Org, and Work for {dateRangeStr}
                </DialogDescription>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant={activeTab === "new" ? "default" : "outline"}
                onClick={() => setActiveTab("new")}
                className="text-xs rounded-full gap-1"
              >
                <BookOpen className="w-3.5 h-3.5" />
                This Week
              </Button>
              <Button
                size="sm"
                variant={activeTab === "history" ? "default" : "outline"}
                onClick={() => setActiveTab("history")}
                className="text-xs rounded-full gap-1"
              >
                <History className="w-3.5 h-3.5" />
                History ({reflections.length})
              </Button>
            </div>
          </div>
        </DialogHeader>

        {activeTab === "new" ? (
          <div className="space-y-6 pt-2">
            {/* 1. Weekly Column Progress Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  This Week&apos;s Column Progress
                </h3>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-foreground">
                  Total: {totalCompleted} / {totalTasks} ({overallPct}%)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {columnStats.map(({ col, completed, total, pct }) => {
                  const styles = getColColorClass(col.colorTheme)
                  return (
                    <div
                      key={col.id}
                      className={`p-3.5 rounded-xl border ${styles.border} ${styles.bg} transition-all`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-bold uppercase tracking-wider ${styles.text}`}>
                          {col.title}
                        </span>
                        <span className="text-xs font-bold text-foreground">
                          {completed}/{total}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                        <div
                          className={`h-full ${styles.bar} transition-all duration-500 rounded-full`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1 text-right font-medium">
                        {pct}% completed
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 2. Interactive Reflective Questionnaire */}
            <div className="space-y-4 pt-2 border-t border-border">
              <h3 className="text-sm font-semibold text-foreground">
                Weekly Reflective Journal
              </h3>

              {/* Wins */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  🏆 What went well this week across Acads, Org, and Work?
                </label>
                <textarea
                  value={wins}
                  onChange={(e) => setWins(e.target.value)}
                  placeholder="e.g., Finished 2 lab assignments in Acads and led the Org general assembly!"
                  className="w-full min-h-[70px] p-3 text-sm rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {/* Challenges */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  ⚡ What challenged you the most, and what did you learn?
                </label>
                <textarea
                  value={challenges}
                  onChange={(e) => setChallenges(e.target.value)}
                  placeholder="e.g., Struggled with time management between exams and project deadlines."
                  className="w-full min-h-[70px] p-3 text-sm rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {/* Next week goals */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  🎯 Top priorities & intentions for next week
                </label>
                <textarea
                  value={nextWeekGoals}
                  onChange={(e) => setNextWeekGoals(e.target.value)}
                  placeholder="e.g., Start research paper early and keep Acads column at 100%!"
                  className="w-full min-h-[70px] p-3 text-sm rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {/* Weekly Rating */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-foreground">
                    Weekly Satisfaction & Effort Rating:
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= rating
                              ? "text-amber-400 fill-amber-400"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {savedSuccess && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Reflection saved!
                    </span>
                  )}
                  <Button
                    onClick={handleSaveReflection}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-95 text-white font-medium text-xs px-5 py-2 rounded-xl shadow-sm"
                  >
                    Save Weekly Reflection
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* History View */
          <div className="space-y-4 pt-2">
            {reflections.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border rounded-2xl">
                <History className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">No past reflections yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Fill out your weekly journal in the &quot;This Week&quot; tab to start tracking your progress over time!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reflections.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 rounded-2xl border border-border bg-card/60 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-semibold text-foreground">
                          {entry.weekDateRange}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= entry.rating
                                ? "text-amber-400 fill-amber-400"
                                : "text-muted-foreground/20"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="p-2.5 rounded-xl bg-secondary/40 border border-border/40">
                        <span className="font-bold text-amber-600 dark:text-amber-400 block mb-1">
                          🏆 Wins
                        </span>
                        <p className="text-foreground/90 whitespace-pre-wrap">{entry.wins}</p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-secondary/40 border border-border/40">
                        <span className="font-bold text-red-600 dark:text-red-400 block mb-1">
                          ⚡ Challenges
                        </span>
                        <p className="text-foreground/90 whitespace-pre-wrap">{entry.challenges}</p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-secondary/40 border border-border/40">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                          🎯 Next Week Goals
                        </span>
                        <p className="text-foreground/90 whitespace-pre-wrap">{entry.nextWeekGoals}</p>
                      </div>
                    </div>

                    {/* Snapshot stats */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {entry.statsSnapshot.byColumn.map((colStat, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium"
                        >
                          {colStat.columnTitle}: {colStat.completed}/{colStat.total}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
