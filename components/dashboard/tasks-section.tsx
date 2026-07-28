"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Calendar,
  Star,
  Circle,
  CheckCircle2,
  Tag,
  ArrowRightLeft,
  Sparkles,
  Edit2,
  LayoutGrid,
  List,
  MoreVertical,
  X,
  Check,
  PlusCircle,
  GripVertical
} from "lucide-react"
import { format } from "date-fns"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { WeeklyReflectionModal, type Column, type Task } from "./weekly-reflection-modal"

interface TasksSectionProps {
  tasks: Task[]
  setTasks: (tasks: Task[]) => void
}

const DEFAULT_COLUMNS: Column[] = [
  { id: "acads", title: "Acads", colorTheme: "red" },
  { id: "org", title: "Org", colorTheme: "yellow" },
  { id: "work", title: "Work", colorTheme: "green" },
]

export function TasksSection({ tasks = [], setTasks }: TasksSectionProps) {
  // Columns state
  const [columns, setColumns] = useLocalStorage<Column[]>("task_columns", DEFAULT_COLUMNS)
  const [viewMode, setViewMode] = useState<"columns" | "list">("columns")

  // Modal states
  const [isReflectionOpen, setIsReflectionOpen] = useState(false)
  const [isAddColOpen, setIsAddColOpen] = useState(false)
  const [newColTitle, setNewColTitle] = useState("")
  const [newColColor, setNewColColor] = useState<Column["colorTheme"]>("blue")

  // Rename Column state
  const [editingColId, setEditingColId] = useState<string | null>(null)
  const [editedColTitle, setEditedColTitle] = useState("")

  // Quick inputs per column: { [columnId]: string }
  const [columnInputs, setColumnInputs] = useState<Record<string, string>>({})
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())

  // Ensure every task is assigned to a column
  const getTaskColumnId = (task: Task): string => {
    if (task.columnId && columns.some((c) => c.id === task.columnId)) {
      return task.columnId
    }
    // Fallback classification for tasks without columnId
    const cat = (task.category || "").toLowerCase()
    const subj = (task.subject || "").toLowerCase()
    if (cat === "organization" || subj.includes("org")) return "org"
    if (cat === "hobby" || subj.includes("work") || subj.includes("job")) return "work"
    return "acads"
  }

  // --- Task CRUD ---
  const addTaskToColumn = (colId: string) => {
    const title = (columnInputs[colId] || "").trim()
    if (!title) return

    const col = columns.find((c) => c.id === colId)
    const subjectName = col ? col.title : "General"

    const newTask: Task = {
      id: Date.now().toString(),
      title,
      subject: subjectName,
      dueDate: new Date().toISOString(),
      priority: "medium",
      urgency: "moderate",
      category: colId === "org" ? "organization" : colId === "work" ? "hobby" : "major-subject",
      completed: false,
      subtasks: [],
      expanded: false,
      columnId: colId,
    }

    setTasks([newTask, ...tasks])
    setColumnInputs({ ...columnInputs, [colId]: "" })
  }

  const toggleTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))
  }

  const toggleExpanded = (id: string) => {
    const next = new Set(expandedTasks)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setExpandedTasks(next)
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id))
  }

  const moveTaskToColumn = (taskId: string, targetColId: string) => {
    const col = columns.find((c) => c.id === targetColId)
    setTasks(
      tasks.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            columnId: targetColId,
            subject: col ? col.title : t.subject,
          }
        }
        return t
      })
    )
  }

  const addSubtask = (parentTaskId: string) => {
    const subtaskTitle = prompt("Add a checklist step:")
    if (!subtaskTitle?.trim()) return

    setTasks(
      tasks.map((t) => {
        if (t.id === parentTaskId) {
          return {
            ...t,
            subtasks: [
              ...(t.subtasks || []),
              {
                id: Date.now().toString(),
                title: subtaskTitle.trim(),
                subject: t.subject,
                dueDate: t.dueDate,
                priority: "medium",
                urgency: "minor",
                category: t.category,
                completed: false,
              },
            ],
            expanded: true,
          }
        }
        return t
      })
    )
    const next = new Set(expandedTasks)
    next.add(parentTaskId)
    setExpandedTasks(next)
  }

  const toggleSubtask = (parentTaskId: string, subtaskId: string) => {
    setTasks(
      tasks.map((t) => {
        if (t.id === parentTaskId) {
          return {
            ...t,
            subtasks: t.subtasks?.map((st) =>
              st.id === subtaskId ? { ...st, completed: !st.completed } : st
            ),
          }
        }
        return t
      })
    )
  }

  const deleteSubtask = (parentTaskId: string, subtaskId: string) => {
    setTasks(
      tasks.map((t) => {
        if (t.id === parentTaskId) {
          return {
            ...t,
            subtasks: t.subtasks?.filter((st) => st.id !== subtaskId),
          }
        }
        return t
      })
    )
  }

  // --- Column CRUD ---
  const handleAddColumn = () => {
    if (!newColTitle.trim()) return
    const id = "col_" + Date.now().toString()
    const newCol: Column = {
      id,
      title: newColTitle.trim(),
      colorTheme: newColColor,
    }
    setColumns([...columns, newCol])
    setNewColTitle("")
    setIsAddColOpen(false)
  }

  const handleDeleteColumn = (colId: string) => {
    if (columns.length <= 1) {
      alert("You need at least one column!")
      return
    }
    if (confirm("Are you sure you want to delete this column? Any tasks inside will move to the first available column.")) {
      const targetFallback = columns.find((c) => c.id !== colId)?.id || "acads"
      setTasks(
        tasks.map((t) => {
          if (getTaskColumnId(t) === colId) {
            return { ...t, columnId: targetFallback }
          }
          return t
        })
      )
      setColumns(columns.filter((c) => c.id !== colId))
    }
  }

  const handleStartRename = (col: Column) => {
    setEditingColId(col.id)
    setEditedColTitle(col.title)
  }

  const handleSaveRename = (colId: string) => {
    if (!editedColTitle.trim()) {
      setEditingColId(null)
      return
    }
    setColumns(
      columns.map((c) => (c.id === colId ? { ...c, title: editedColTitle.trim() } : c))
    )
    // also update subject in tasks of this col
    setTasks(
      tasks.map((t) => {
        if (getTaskColumnId(t) === colId) {
          return { ...t, subject: editedColTitle.trim() }
        }
        return t
      })
    )
    setEditingColId(null)
  }

  // --- Helpers for Color Themes ---
  const getColHeaderStyles = (theme: Column["colorTheme"]) => {
    switch (theme) {
      case "red":
        return {
          badge: "bg-red-500 text-white shadow-sm",
          borderTop: "border-t-4 border-t-red-500",
          progressFill: "bg-red-500",
          progressTrack: "bg-red-100 dark:bg-red-950/40",
          accentText: "text-red-600 dark:text-red-400",
          cardBorderHover: "hover:border-red-400/80",
          badgeSoft: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800",
        }
      case "yellow":
        return {
          badge: "bg-amber-500 text-white shadow-sm",
          borderTop: "border-t-4 border-t-amber-500",
          progressFill: "bg-amber-500",
          progressTrack: "bg-amber-100 dark:bg-amber-950/40",
          accentText: "text-amber-600 dark:text-amber-400",
          cardBorderHover: "hover:border-amber-400/80",
          badgeSoft: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
        }
      case "green":
        return {
          badge: "bg-emerald-500 text-white shadow-sm",
          borderTop: "border-t-4 border-t-emerald-500",
          progressFill: "bg-emerald-500",
          progressTrack: "bg-emerald-100 dark:bg-emerald-950/40",
          accentText: "text-emerald-600 dark:text-emerald-400",
          cardBorderHover: "hover:border-emerald-400/80",
          badgeSoft: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
        }
      case "blue":
        return {
          badge: "bg-blue-500 text-white shadow-sm",
          borderTop: "border-t-4 border-t-blue-500",
          progressFill: "bg-blue-500",
          progressTrack: "bg-blue-100 dark:bg-blue-950/40",
          accentText: "text-blue-600 dark:text-blue-400",
          cardBorderHover: "hover:border-blue-400/80",
          badgeSoft: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
        }
      case "purple":
        return {
          badge: "bg-purple-500 text-white shadow-sm",
          borderTop: "border-t-4 border-t-purple-500",
          progressFill: "bg-purple-500",
          progressTrack: "bg-purple-100 dark:bg-purple-950/40",
          accentText: "text-purple-600 dark:text-purple-400",
          cardBorderHover: "hover:border-purple-400/80",
          badgeSoft: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
        }
      default:
        return {
          badge: "bg-slate-500 text-white shadow-sm",
          borderTop: "border-t-4 border-t-slate-500",
          progressFill: "bg-slate-500",
          progressTrack: "bg-slate-100 dark:bg-slate-900",
          accentText: "text-slate-600 dark:text-slate-400",
          cardBorderHover: "hover:border-slate-400/80",
          badgeSoft: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800",
        }
    }
  }

  // Sample data button for instant testing
  const loadSampleTasks = () => {
    const sample: Task[] = [
      {
        id: "s1",
        title: "Finish Differential Equations Lab",
        subject: "Acads",
        dueDate: new Date().toISOString(),
        priority: "high",
        urgency: "critical",
        category: "major-subject",
        completed: false,
        columnId: "acads",
        subtasks: [
          { id: "st1", title: "Solve problem set 1-5", subject: "Acads", dueDate: new Date().toISOString(), priority: "medium", urgency: "minor", category: "major-subject", completed: true },
          { id: "st2", title: "Write lab discussion", subject: "Acads", dueDate: new Date().toISOString(), priority: "medium", urgency: "minor", category: "major-subject", completed: false },
        ],
      },
      {
        id: "s2",
        title: "Read Chapter 7 in Physics",
        subject: "Acads",
        dueDate: new Date().toISOString(),
        priority: "medium",
        urgency: "moderate",
        category: "major-subject",
        completed: true,
        columnId: "acads",
        subtasks: [],
      },
      {
        id: "s3",
        title: "Prepare Org General Assembly slides",
        subject: "Org",
        dueDate: new Date().toISOString(),
        priority: "high",
        urgency: "moderate",
        category: "organization",
        completed: false,
        columnId: "org",
        subtasks: [
          { id: "st3", title: "Outline agenda points", subject: "Org", dueDate: new Date().toISOString(), priority: "medium", urgency: "minor", category: "organization", completed: true },
          { id: "st4", title: "Design slide deck", subject: "Org", dueDate: new Date().toISOString(), priority: "medium", urgency: "minor", category: "organization", completed: false },
        ],
      },
      {
        id: "s4",
        title: "Complete Freelance Client Mockup",
        subject: "Work",
        dueDate: new Date().toISOString(),
        priority: "medium",
        urgency: "minor",
        category: "hobby",
        completed: false,
        columnId: "work",
        subtasks: [],
      },
    ]
    setTasks([...sample, ...tasks])
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-amber-600 dark:from-blue-400 dark:via-purple-400 dark:to-amber-400 bg-clip-text text-transparent">
              My Day &amp; Columns
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800">
              Acads • Org • Work
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {format(new Date(), "EEEE, MMMM d")} • Independent columns with checklist progress &amp; weekly reflection
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {tasks.length === 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={loadSampleTasks}
              className="text-xs rounded-full border-dashed border-blue-400 text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40"
            >
              <PlusCircle className="w-3.5 h-3.5 mr-1" />
              Load Example Tasks
            </Button>
          )}

          <Button
            size="sm"
            onClick={() => setIsReflectionOpen(true)}
            className="text-xs rounded-full bg-gradient-to-r from-amber-500 to-red-500 text-white font-medium shadow-sm hover:opacity-95 gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Weekly Reflection &amp; Progress
          </Button>

          {/* View Toggle */}
          <div className="flex items-center bg-secondary/80 p-1 rounded-full border border-border">
            <button
              onClick={() => setViewMode("columns")}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                viewMode === "columns"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Columns
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                viewMode === "list"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              List
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAddColOpen(true)}
            className="text-xs rounded-full gap-1 border-border bg-card hover:bg-secondary"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Column
          </Button>
        </div>
      </div>

      {/* ====================================================================================
          COLUMNS (KANBAN BOARD) VIEW - HERO FEATURE
          ==================================================================================== */}
      {viewMode === "columns" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {columns.map((col) => {
            const styles = getColHeaderStyles(col.colorTheme)
            const colTasks = tasks.filter((t) => getTaskColumnId(t) === col.id)
            const completedCount = colTasks.filter((t) => t.completed).length
            const totalCount = colTasks.length
            const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

            return (
              <div
                key={col.id}
                className={`flex flex-col rounded-2xl bg-card border border-border shadow-sm transition-shadow hover:shadow-md overflow-hidden ${styles.borderTop}`}
              >
                {/* Column Header */}
                <div className="p-4 border-b border-border bg-card/60">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {editingColId === col.id ? (
                        <div className="flex items-center gap-1">
                          <Input
                            value={editedColTitle}
                            onChange={(e) => setEditedColTitle(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSaveRename(col.id)}
                            className="h-7 text-sm font-bold w-32"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveRename(col.id)}
                            className="p-1 hover:bg-secondary rounded text-emerald-600"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingColId(null)}
                            className="p-1 hover:bg-secondary rounded text-muted-foreground"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full ${styles.badge}`}>
                            {col.title}
                          </span>
                          <span className="text-xs text-muted-foreground font-semibold">
                            {completedCount}/{totalCount}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Column settings menu / rename / delete */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartRename(col)}
                        title="Rename Column"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {col.id !== "acads" && col.id !== "org" && col.id !== "work" && (
                        <button
                          onClick={() => handleDeleteColumn(col.id)}
                          title="Delete Custom Column"
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Column Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[11px] text-muted-foreground font-medium">
                      <span>Checklist Completion</span>
                      <span className={`font-bold ${styles.accentText}`}>{progressPct}%</span>
                    </div>
                    <div className={`w-full h-2 rounded-full ${styles.progressTrack} overflow-hidden`}>
                      <div
                        className={`h-full ${styles.progressFill} transition-all duration-500 rounded-full`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Dedicated Add Task to This Column */}
                <div className="p-3 border-b border-border bg-secondary/30">
                  <div className="flex items-center gap-1.5 bg-card border border-border rounded-xl px-3 py-1.5 shadow-2xs focus-within:ring-2 focus-within:ring-blue-500/50">
                    <button
                      onClick={() => addTaskToColumn(col.id)}
                      className={`text-muted-foreground hover:${styles.accentText} transition-colors`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <Input
                      value={columnInputs[col.id] || ""}
                      onChange={(e) =>
                        setColumnInputs({ ...columnInputs, [col.id]: e.target.value })
                      }
                      onKeyDown={(e) => e.key === "Enter" && addTaskToColumn(col.id)}
                      placeholder={`+ Add to ${col.title}...`}
                      className="border-none bg-transparent h-7 text-xs shadow-none focus-visible:ring-0 p-0 text-foreground placeholder:text-muted-foreground"
                    />
                    <Button
                      size="sm"
                      onClick={() => addTaskToColumn(col.id)}
                      className="h-6 px-2 text-[11px] rounded-lg"
                    >
                      Add
                    </Button>
                  </div>
                </div>

                {/* Tasks List for this Column */}
                <div className="p-3 space-y-2.5 max-h-[600px] overflow-y-auto min-h-[160px]">
                  {colTasks.length > 0 ? (
                    colTasks
                      .slice()
                      .sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1))
                      .map((task) => {
                        const subCompleted = task.subtasks?.filter((st) => st.completed).length || 0
                        const subTotal = task.subtasks?.length || 0
                        const isExpanded = expandedTasks.has(task.id)

                        return (
                          <div
                            key={task.id}
                            className={`group rounded-xl border border-border bg-card p-3 shadow-2xs transition-all ${styles.cardBorderHover} ${
                              task.completed ? "opacity-60 bg-secondary/20" : "hover:shadow-sm"
                            }`}
                          >
                            {/* Task Top Bar */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                <button
                                  onClick={() => toggleTask(task.id)}
                                  className="mt-0.5 text-muted-foreground hover:text-blue-600 transition-colors shrink-0"
                                >
                                  {task.completed ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                                  ) : (
                                    <Circle className="w-5 h-5" />
                                  )}
                                </button>

                                <div className="flex-1 min-w-0">
                                  <p
                                    onClick={() => toggleTask(task.id)}
                                    className={`text-sm font-medium leading-snug cursor-pointer transition-all ${
                                      task.completed ? "line-through text-muted-foreground" : "text-foreground"
                                    }`}
                                  >
                                    {task.title}
                                  </p>

                                  {/* Task Badges: Subtasks checklist + Move Column dropdown */}
                                  <div className="flex flex-wrap items-center gap-2 mt-2">
                                    {/* Checklist progress badge */}
                                    {subTotal > 0 && (
                                      <button
                                        onClick={() => toggleExpanded(task.id)}
                                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-colors flex items-center gap-1 ${
                                          subCompleted === subTotal
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                                            : "bg-secondary text-muted-foreground border-border"
                                        }`}
                                      >
                                        <CheckCircle2 className="w-3 h-3" />
                                        {subCompleted}/{subTotal} steps
                                      </button>
                                    )}

                                    {/* Move to another column */}
                                    <div className="relative inline-block">
                                      <select
                                        value={col.id}
                                        onChange={(e) => moveTaskToColumn(task.id, e.target.value)}
                                        className="text-[10px] font-medium bg-secondary text-muted-foreground hover:text-foreground border border-border rounded-full px-2 py-0.5 cursor-pointer outline-none transition-colors"
                                        title="Move to another column"
                                      >
                                        {columns.map((cCol) => (
                                          <option key={cCol.id} value={cCol.id}>
                                            Move → {cCol.title}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Action tools */}
                              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => toggleExpanded(task.id)}
                                  title="Expand checklist steps"
                                  className="p-1 text-muted-foreground hover:text-foreground rounded"
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  ) : (
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                <button
                                  onClick={() => addSubtask(task.id)}
                                  title="Add checklist step"
                                  className="p-1 text-muted-foreground hover:text-foreground rounded"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => deleteTask(task.id)}
                                  title="Delete task"
                                  className="p-1 text-muted-foreground hover:text-red-500 rounded"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Subtask / Checklist items inside card */}
                            {isExpanded && (
                              <div className="mt-3 pt-2 border-t border-border/70 space-y-1.5 pl-7">
                                {task.subtasks && task.subtasks.length > 0 ? (
                                  task.subtasks.map((subtask) => (
                                    <div
                                      key={subtask.id}
                                      className="flex items-center justify-between group/sub text-xs p-1 rounded hover:bg-secondary/60"
                                    >
                                      <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <button
                                          onClick={() => toggleSubtask(task.id, subtask.id)}
                                          className="text-muted-foreground hover:text-blue-500"
                                        >
                                          {subtask.completed ? (
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                          ) : (
                                            <Circle className="w-3.5 h-3.5" />
                                          )}
                                        </button>
                                        <span
                                          className={`truncate ${
                                            subtask.completed
                                              ? "line-through text-muted-foreground"
                                              : "text-foreground"
                                          }`}
                                        >
                                          {subtask.title}
                                        </span>
                                      </div>
                                      <button
                                        onClick={() => deleteSubtask(task.id, subtask.id)}
                                        className="opacity-0 group-hover/sub:opacity-100 text-muted-foreground hover:text-red-500 p-0.5"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-[11px] text-muted-foreground italic">
                                    No checklist steps yet. Click &apos;+&apos; above to add steps.
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })
                  ) : (
                    <div className="text-center py-8 border border-dashed border-border rounded-xl">
                      <p className="text-xs font-medium text-muted-foreground">No tasks in {col.title}</p>
                      <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                        Type below to add a task!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* ====================================================================================
           LIST VIEW (GROUPED BY COLUMN) - FOR ALTERNATIVE PREFERENCE
           ==================================================================================== */
        <div className="space-y-6">
          {columns.map((col) => {
            const styles = getColHeaderStyles(col.colorTheme)
            const colTasks = tasks.filter((t) => getTaskColumnId(t) === col.id)
            const completedCount = colTasks.filter((t) => t.completed).length
            const totalCount = colTasks.length

            return (
              <div key={col.id} className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-4 bg-secondary/40 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full ${styles.badge}`}>
                      {col.title}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {completedCount} of {totalCount} completed
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  {colTasks.length > 0 ? (
                    colTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-secondary/40 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleTask(task.id)}
                            className="text-muted-foreground hover:text-blue-500"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <Circle className="w-5 h-5" />
                            )}
                          </button>
                          <span
                            className={`text-sm font-medium ${
                              task.completed ? "line-through text-muted-foreground" : "text-foreground"
                            }`}
                          >
                            {task.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={col.id}
                            onChange={(e) => moveTaskToColumn(task.id, e.target.value)}
                            className="text-xs bg-secondary border border-border rounded-lg px-2 py-1 text-muted-foreground"
                          >
                            {columns.map((cCol) => (
                              <option key={cCol.id} value={cCol.id}>
                                Move → {cCol.title}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="text-muted-foreground hover:text-red-500 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground italic text-center py-4">
                      No tasks in {col.title}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ====================================================================================
          ADD CUSTOM COLUMN MODAL
          ==================================================================================== */}
      {isAddColOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">Add Custom Column</h3>
              <button
                onClick={() => setIsAddColOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Column Name</label>
                <Input
                  value={newColTitle}
                  onChange={(e) => setNewColTitle(e.target.value)}
                  placeholder="e.g., Fitness, Side Projects, Personal"
                  className="text-sm"
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Color Theme</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {(["red", "yellow", "green", "blue", "purple", "orange", "pink", "slate"] as const).map(
                    (color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewColColor(color)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider capitalize border ${
                          newColColor === color
                            ? "ring-2 ring-blue-500 ring-offset-2 border-transparent"
                            : "border-border opacity-70 hover:opacity-100"
                        }`}
                      >
                        {color}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddColOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleAddColumn}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add Column
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================================
          WEEKLY REFLECTION & PROGRESS MODAL
          ==================================================================================== */}
      <WeeklyReflectionModal
        isOpen={isReflectionOpen}
        onClose={() => setIsReflectionOpen(false)}
        tasks={tasks}
        columns={columns}
      />
    </div>
  )
}