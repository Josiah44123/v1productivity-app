"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, CheckCircle2, Circle, AlertCircle } from "lucide-react"
import { createTask, updateTask, deleteTask } from "@/app/actions"

export function TasksSection({ tasks, refreshTasks }: { tasks: any[], refreshTasks: () => void }) {
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [priority, setPriority] = useState("medium")
  const [loading, setLoading] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return
    setLoading(true)
    try {
      await createTask({ title: newTaskTitle, priority })
      setNewTaskTitle("")
      refreshTasks()
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (task: any) => {
    await updateTask(task.id, { completed: !task.completed })
    refreshTasks()
  }

  const handleDelete = async (id: string) => {
    await deleteTask(id)
    refreshTasks()
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed === b.completed) {
      const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    }
    return a.completed ? 1 : -1
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-gray-200 dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Prioritize and track your work</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <form onSubmit={handleCreate} className="flex gap-2">
          <Input 
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            placeholder="What needs to be done today?" 
            className="flex-1"
          />
          <select 
            value={priority} 
            onChange={e => setPriority(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 text-sm outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-gray-700"
          >
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
          <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </form>
      </div>

      <div className="space-y-2">
        {sortedTasks.map(task => (
          <div key={task.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${task.completed ? "bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800 opacity-60" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md"}`}>
            <div className="flex items-center gap-3">
              <button onClick={() => handleToggle(task)} className="text-gray-400 hover:text-blue-600 transition-colors">
                {task.completed ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <Circle className="w-6 h-6" />}
              </button>
              <span className={`font-medium ${task.completed ? "line-through text-gray-500" : "text-gray-900 dark:text-gray-100"}`}>
                {task.title}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              {!task.completed && (
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1
                  ${task.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : ''}
                  ${task.priority === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : ''}
                  ${task.priority === 'low' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                `}>
                  {task.priority === 'high' && <AlertCircle className="w-3 h-3" />}
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
              )}
              
              <button onClick={() => handleDelete(task.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
            No pending tasks. Add one above!
          </div>
        )}
      </div>
    </div>
  )
}