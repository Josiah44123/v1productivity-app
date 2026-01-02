"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Check, ChevronDown, ChevronRight, CheckCircle } from "lucide-react"
import { format } from "date-fns"

interface Task {
  id: string
  title: string
  subject: string
  description?: string
  dueDate: string
  priority: "low" | "medium" | "high"
  urgency: "minor" | "moderate" | "critical"
  category: "major-subject" | "minor-subject" | "hobby" | "extracurricular" | "organization"
  completed: boolean
  subtasks?: Task[]
  expanded?: boolean
}

interface TasksSectionProps {
  tasks: Task[]
  setTasks: (tasks: Task[]) => void
}

export function TasksSection({ tasks = [], setTasks }: TasksSectionProps) {
  const [newTask, setNewTask] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("All")
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())
  const [newUrgency, setNewUrgency] = useState<"minor" | "moderate" | "critical">("moderate")
  const [newCategory, setNewCategory] = useState<
    "major-subject" | "minor-subject" | "hobby" | "extracurricular" | "organization"
  >("major-subject")

  const subjects = Array.from(new Set(tasks.map((t) => t.subject)))

  const addTask = () => {
    if (!newTask.trim()) return
    const task: Task = {
      id: Date.now().toString(),
      title: newTask,
      subject: newCategory.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      dueDate: new Date().toISOString(),
      priority: "medium",
      urgency: newUrgency,
      category: newCategory,
      completed: false,
      subtasks: [],
      expanded: false,
    }
    setTasks([...tasks, task])
    setNewTask("")
  }

  const toggleTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))
  }

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedTasks)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedTasks(newExpanded)
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id))
  }

  const addSubtask = (parentTaskId: string) => {
    const subtaskTitle = prompt("Enter subtask title:")
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
                title: subtaskTitle,
                subject: t.subject,
                dueDate: t.dueDate,
                priority: "medium",
                urgency: "minor",
                category: t.category,
                completed: false,
              },
            ],
          }
        }
        return t
      }),
    )
  }

  const deleteCompletedTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id))
  }

  const filteredTasks = selectedSubject === "All" ? tasks : tasks.filter((t) => t.subject === selectedSubject)

  const getUrgencyStyle = (urgency: string) => {
    if (!urgency) return ""
    switch (urgency) {
      case "critical":
        return "bg-red-500/10 text-red-500 border border-red-500/30"
      case "moderate":
        return "bg-yellow-500/10 text-yellow-500 border border-yellow-500/30"
      case "minor":
        return "bg-green-500/10 text-green-500 border border-green-500/30"
      default:
        return ""
    }
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      "major-subject": "Major Subject",
      "minor-subject": "Minor Subject",
      hobby: "Hobby",
      extracurricular: "Extracurricular",
      organization: "Organization",
    }
    return labels[category] || category
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-pink-400 to-orange-500 bg-clip-text text-transparent">
          Tasks & To-Do
        </h1>
        <p className="text-orange-300/70 mt-2">Manage your tasks with urgency levels and categories</p>
      </div>

      <Card className="border-2 border-orange-500/30 glow-card">
        <CardHeader>
          <CardTitle className="text-orange-300">Add New Task</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Enter task title..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addTask()}
            className="bg-input border-border/40"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-orange-300/70 mb-2 block">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-md bg-input border border-border/40 text-sm outline-none"
              >
                <option value="major-subject">Major Subject</option>
                <option value="minor-subject">Minor Subject</option>
                <option value="hobby">Hobby</option>
                <option value="extracurricular">Extracurricular</option>
                <option value="organization">Organization</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-orange-300/70 mb-2 block">Priority</label>
              <select
                value={newUrgency}
                onChange={(e) => setNewUrgency(e.target.value as any)}
                className="w-full px-3 py-2 rounded-md bg-input border border-border/40 text-sm outline-none"
              >
                <option value="minor">Minor</option>
                <option value="moderate">Moderate</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <Button
            onClick={addTask}
            className="w-full gap-2 transition-all active:scale-95 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </Button>
        </CardContent>
      </Card>

      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={selectedSubject === "All" ? "default" : "outline"}
          onClick={() => setSelectedSubject("All")}
          className="transition-all active:scale-95"
        >
          All
        </Button>
        {subjects.map((subject) => (
          <Button
            key={subject}
            variant={selectedSubject === subject ? "default" : "outline"}
            onClick={() => setSelectedSubject(subject)}
            className="whitespace-nowrap transition-all active:scale-95"
          >
            {subject}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <Card
              key={task.id}
              className="glow-card hover:glow-orange transition-all group border-2 border-transparent hover:border-orange-500/30 animate-in fade-in duration-300"
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`mt-1 p-1 rounded transition-all ${
                      task.completed
                        ? "bg-green-500/20 border-green-500/50"
                        : "border border-border/40 hover:bg-card/50"
                    }`}
                  >
                    {task.completed && <Check className="w-4 h-4 text-green-500" />}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {task.subtasks && task.subtasks.length > 0 && (
                        <button onClick={() => toggleExpanded(task.id)} className="p-1 transition-all active:scale-90">
                          {expandedTasks.has(task.id) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                      )}
                      <div className="flex-1">
                        <p className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                          {task.title}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="text-xs bg-orange-500/10 px-2 py-1 rounded border border-orange-500/40 text-orange-300">
                            {task.subject}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded text-xs font-medium ${getUrgencyStyle(task.urgency)}`}
                          >
                            {task.urgency ? task.urgency.charAt(0).toUpperCase() + task.urgency.slice(1) : "Unknown"}
                          </span>
                          <span className="text-xs bg-orange-500/10 px-2 py-1 rounded border border-orange-500/40 text-orange-300">
                            {getCategoryLabel(task.category)}
                          </span>
                          <span className="text-xs text-orange-300/70">{format(new Date(task.dueDate), "MMM d")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!task.completed ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addSubtask(task.id)}
                          title="Add subtask"
                          className="transition-all active:scale-95"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleTask(task.id)}
                          title="Mark as complete"
                          className="hover:bg-green-500/20 transition-all active:scale-95"
                        >
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTask(task.id)}
                          className="transition-all active:scale-95"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCompletedTask(task.id)}
                        title="Remove completed task"
                        className="hover:bg-red-500/20 transition-all active:scale-95"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>

                {task.subtasks && task.subtasks.length > 0 && expandedTasks.has(task.id) && (
                  <div className="mt-4 ml-8 space-y-2 border-l border-border/40 pl-4">
                    {task.subtasks.map((subtask) => (
                      <div key={subtask.id} className="flex items-center justify-between group">
                        <div className="flex items-center gap-2 flex-1">
                          <button
                            onClick={() => {
                              const updatedTasks = tasks.map((t) => {
                                if (t.id === task.id) {
                                  return {
                                    ...t,
                                    subtasks: t.subtasks?.map((st) =>
                                      st.id === subtask.id ? { ...st, completed: !st.completed } : st,
                                    ),
                                  }
                                }
                                return t
                              })
                              setTasks(updatedTasks)
                            }}
                            className={`p-1 rounded ${subtask.completed ? "bg-green-500/20" : "border border-border/40"}`}
                          >
                            {subtask.completed && <Check className="w-3 h-3 text-green-500" />}
                          </button>
                          <span
                            className={subtask.completed ? "line-through text-muted-foreground text-sm" : "text-sm"}
                          >
                            {subtask.title}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            const updatedTasks = tasks.map((t) => {
                              if (t.id === task.id) {
                                return {
                                  ...t,
                                  subtasks: t.subtasks?.filter((st) => st.id !== subtask.id),
                                }
                              }
                              return t
                            })
                            setTasks(updatedTasks)
                          }}
                          className="p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="glow-card">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No tasks yet. Create one to get started!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
