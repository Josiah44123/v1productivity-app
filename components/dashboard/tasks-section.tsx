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
  Tag
} from "lucide-react"
import { format } from "date-fns"

// --- Types ---
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
  // --- State ---
  const [newTask, setNewTask] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("All")
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())
  
  // Quick-add settings
  const [newUrgency, setNewUrgency] = useState<"minor" | "moderate" | "critical">("moderate")
  const [newCategory, setNewCategory] = useState<Task['category']>("major-subject")

  // Filter out "General" so the button doesn't appear
  const subjects = Array.from(new Set(tasks.map((t) => t.subject))).filter(s => s !== "General")

  // --- Logic ---
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
    setTasks([task, ...tasks])
    setNewTask("")
  }

  const toggleTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))
  }

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedTasks)
    if (newExpanded.has(id)) newExpanded.delete(id)
    else newExpanded.add(id)
    setExpandedTasks(newExpanded)
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id))
  }

  const addSubtask = (parentTaskId: string) => {
    const subtaskTitle = prompt("Add a step:")
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
            expanded: true,
          }
        }
        return t
      })
    )
    setExpandedTasks(new Set(expandedTasks).add(parentTaskId))
  }

  // --- Helpers for Colors ---
  // UPDATED: Now returns styles for Border, Background, and Left-Border-Color
  const getTaskStyles = (urgency: string) => {
    switch (urgency) {
      case "critical": 
        return "border-red-500/40 bg-red-500/5 border-l-red-500"
      case "moderate": 
        return "border-amber-500/40 bg-amber-500/5 border-l-amber-500"
      case "minor": 
        return "border-emerald-500/40 bg-emerald-500/5 border-l-emerald-500"
      default: 
        return "border-border/50 bg-secondary/10 border-l-slate-500"
    }
  }

  const getCategoryColorStyles = (category: string) => {
    switch (category) {
      case "major-subject": return "bg-blue-500/20 text-blue-300 border border-blue-500/30"
      case "minor-subject": return "bg-purple-500/20 text-purple-300 border border-purple-500/30"
      case "hobby": return "bg-green-500/20 text-green-300 border border-green-500/30"
      case "organization": return "bg-orange-500/20 text-orange-300 border border-orange-500/30"
      case "extracurricular": return "bg-pink-500/20 text-pink-300 border border-pink-500/30"
      default: return "bg-secondary text-muted-foreground"
    }
  }

  const getUrgencySelectStyles = (urgency: string) => {
    switch (urgency) {
      case "critical": return "bg-red-500/20 text-red-400 border-red-500/30"
      case "moderate": return "bg-amber-500/20 text-amber-400 border-amber-500/30"
      case "minor": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
      default: return "bg-secondary text-muted-foreground"
    }
  }

  const filteredTasks = selectedSubject === "All" 
    ? tasks 
    : tasks.filter((t) => t.subject === selectedSubject)

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-500 bg-clip-text text-transparent">
            My Day
          </h1>
          <p className="text-blue-300/70 mt-1">{format(new Date(), "EEEE, MMMM d")}</p>
        </div>
        
        {/* Subject Filters */}
        <div className="flex gap-2 overflow-x-auto max-w-full pb-2 md:pb-0 scrollbar-hide">
            <Button
              size="sm"
              variant={selectedSubject === "All" ? "default" : "secondary"}
              onClick={() => setSelectedSubject("All")}
              className="rounded-full px-4"
            >
              All
            </Button>
            {subjects.map((subject) => (
              <Button
                key={subject}
                size="sm"
                variant={selectedSubject === subject ? "default" : "outline"}
                onClick={() => setSelectedSubject(subject)}
                className="rounded-full whitespace-nowrap border-blue-500/30"
              >
                {subject}
              </Button>
            ))}
        </div>
      </div>

      {/* Main Input Bar - MS To Do Style */}
      <div className="relative group z-10 mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative bg-background/80 backdrop-blur-md border border-blue-500/30 rounded-xl shadow-lg flex items-center p-2 gap-2 transition-all group-hover:bg-background/90 group-focus-within:bg-background">
            
            {/* MS To Do Style Button */}
            <button 
                onClick={addTask}
                className="ml-2 w-8 h-8 flex items-center justify-center rounded-full text-blue-400 transition-all duration-300"
            >
                <Plus className="w-6 h-6 absolute transition-all duration-300 scale-100 opacity-100 group-hover:scale-0 group-hover:opacity-0 group-focus-within:scale-0 group-focus-within:opacity-0" />
                <Circle className="w-5 h-5 absolute transition-all duration-300 scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 group-focus-within:scale-100 group-focus-within:opacity-100" />
            </button>

            <Input 
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addTask()}
                placeholder="Add a task" 
                className="border-none bg-transparent shadow-none focus-visible:ring-0 text-lg placeholder:text-muted-foreground/50 h-12 flex-1"
            />
            
            {/* Quick Settings */}
            <div className="hidden sm:flex items-center gap-2 pr-2">
                <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className={`text-xs px-3 py-1.5 rounded-md border outline-none cursor-pointer font-medium transition-colors ${getCategoryColorStyles(newCategory)}`}
                >
                    <option value="major-subject" className="bg-background text-foreground">Major Subject</option>
                    <option value="minor-subject" className="bg-background text-foreground">Minor Subject</option>
                    <option value="hobby" className="bg-background text-foreground">Hobby</option>
                    <option value="organization" className="bg-background text-foreground">Organization</option>
                    <option value="extracurricular" className="bg-background text-foreground">Extracurricular</option>
                </select>
                
                <select
                    value={newUrgency}
                    onChange={(e) => setNewUrgency(e.target.value as any)}
                    className={`text-xs px-3 py-1.5 rounded-md border outline-none cursor-pointer font-medium transition-colors ${getUrgencySelectStyles(newUrgency)}`}
                >
                    <option value="minor" className="bg-background text-foreground">Minor (!)</option>
                    <option value="moderate" className="bg-background text-foreground">Moderate (!!)</option>
                    <option value="critical" className="bg-background text-foreground">Critical (!!!)</option>
                </select>
            </div>
        </div>
        
        {/* Mobile View controls */}
        <div className="flex sm:hidden justify-between mt-2 gap-2">
             <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className={`flex-1 text-xs px-3 py-2 rounded-md border outline-none cursor-pointer font-medium transition-colors ${getCategoryColorStyles(newCategory)}`}
                >
                    <option value="major-subject" className="bg-background text-foreground">Major</option>
                    <option value="minor-subject" className="bg-background text-foreground">Minor</option>
                    <option value="hobby" className="bg-background text-foreground">Hobby</option>
                    <option value="organization" className="bg-background text-foreground">Org</option>
            </select>
             <select
                    value={newUrgency}
                    onChange={(e) => setNewUrgency(e.target.value as any)}
                    className={`flex-1 text-xs px-3 py-2 rounded-md border outline-none cursor-pointer font-medium transition-colors ${getUrgencySelectStyles(newUrgency)}`}
                >
                    <option value="minor" className="bg-background text-foreground">Minor</option>
                    <option value="moderate" className="bg-background text-foreground">Moderate</option>
                    <option value="critical" className="bg-background text-foreground">Critical</option>
            </select>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {sortedTasks.length > 0 ? (
          sortedTasks.map((task) => (
            <div 
                key={task.id} 
                className={`group relative transition-all duration-300 ${task.completed ? 'opacity-60 grayscale' : 'opacity-100'}`}
            >
                {/* Task Item Container */}
                <div className={`
                    relative flex items-center gap-4 p-4 rounded-xl shadow-sm
                    transition-all cursor-default
                    border border-l-[6px]
                    /* This applies the specific urgency colors permanently */
                    ${getTaskStyles(task.urgency)}
                    hover:shadow-md hover:-translate-y-0.5
                `}>
                    
                    {/* Checkbox */}
                    <button 
                        onClick={() => toggleTask(task.id)}
                        className="flex-shrink-0 text-muted-foreground hover:text-blue-500 transition-colors scale-110"
                    >
                        {task.completed ? (
                            <CheckCircle2 className="w-6 h-6 text-blue-500 fill-blue-500/20" />
                        ) : (
                            <Circle className="w-6 h-6" />
                        )}
                    </button>

                    {/* Task Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center" onClick={() => toggleTask(task.id)}>
                        <span className={`text-base font-medium truncate transition-all ${
                            task.completed ? "line-through text-muted-foreground" : "text-foreground"
                        }`}>
                            {task.title}
                        </span>
                        
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5">
                            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${getCategoryColorStyles(task.category)} border bg-opacity-10 text-[10px] font-semibold uppercase tracking-wide`}>
                                <Tag className="w-3 h-3" />
                                {task.subject}
                            </span>
                            
                            {task.subtasks && task.subtasks.length > 0 && (
                                <span className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                                    {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length} steps
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(task.dueDate), "MMM d")}
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 backdrop-blur-sm rounded-lg p-1 border border-white/5 shadow-sm">
                         <button 
                            onClick={(e) => { e.stopPropagation(); toggleExpanded(task.id); }}
                            className="p-2 hover:bg-background rounded-md text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {expandedTasks.has(task.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                        
                        <button 
                            onClick={(e) => { e.stopPropagation(); addSubtask(task.id); }}
                            className="p-2 hover:bg-background rounded-md text-muted-foreground hover:text-foreground transition-colors"
                            title="Add Step"
                        >
                            <Plus className="w-4 h-4" />
                        </button>

                        <button 
                            onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                            className="p-2 hover:bg-red-500/10 rounded-md text-muted-foreground hover:text-red-400 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        
                        <div className="px-1 border-l border-white/10 ml-1 pl-2">
                             <Star className={`w-4 h-4 ${task.urgency === 'critical' ? 'fill-red-400 text-red-400' : 'text-muted-foreground/30'}`} />
                        </div>
                    </div>
                </div>

                {/* Subtasks List */}
                {task.subtasks && task.subtasks.length > 0 && expandedTasks.has(task.id) && (
                    <div className="ml-6 pl-6 border-l-2 border-dashed border-muted/20 mt-2 space-y-2 relative">
                        {task.subtasks.map((subtask) => (
                            <div key={subtask.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/5 hover:bg-secondary/10 transition-colors group/sub border border-transparent hover:border-white/5">
                                <button 
                                    onClick={() => {
                                        const updatedTasks = tasks.map(t => 
                                            t.id === task.id 
                                            ? { ...t, subtasks: t.subtasks?.map(st => st.id === subtask.id ? { ...st, completed: !st.completed } : st) }
                                            : t
                                        );
                                        setTasks(updatedTasks);
                                    }}
                                    className="text-muted-foreground hover:text-blue-500 transition-colors"
                                >
                                    {subtask.completed ? <CheckCircle2 className="w-4 h-4 text-blue-500" /> : <Circle className="w-4 h-4" />}
                                </button>
                                <span className={`text-sm flex-1 ${subtask.completed ? "line-through text-muted-foreground" : "text-foreground/90"}`}>
                                    {subtask.title}
                                </span>
                                <button 
                                    onClick={() => {
                                         const updatedTasks = tasks.map(t => 
                                            t.id === task.id 
                                            ? { ...t, subtasks: t.subtasks?.filter(st => st.id !== subtask.id) }
                                            : t
                                        );
                                        setTasks(updatedTasks);
                                    }}
                                    className="opacity-0 group-hover/sub:opacity-100 p-1.5 hover:text-red-400 transition-opacity"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center opacity-60">
             <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-12 h-12 text-blue-500/50" />
             </div>
             <p className="text-lg font-medium text-blue-300">All caught up!</p>
             <p className="text-sm text-muted-foreground">Enjoy your day or add a new task above.</p>
          </div>
        )}
      </div>
    </div>
  )
}