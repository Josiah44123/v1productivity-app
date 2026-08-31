"use client"

import { useState, useEffect } from "react"
import { Play, Pause, RotateCcw, Timer } from "lucide-react"

interface PomodoroTimerProps {
  isCollapsed?: boolean
}

export function PomodoroTimer({ isCollapsed }: PomodoroTimerProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState<"work" | "break">("work")

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setIsActive(false)
      if (mode === "work") {
        setMode("break")
        setTimeLeft(5 * 60)
      } else {
        setMode("work")
        setTimeLeft(25 * 60)
      }
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft, mode])

  const toggleTimer = () => setIsActive(!isActive)

  const resetTimer = () => {
    setIsActive(false)
    setTimeLeft(mode === "work" ? 25 * 60 : 5 * 60)
  }

  const switchMode = (newMode: "work" | "break") => {
    setMode(newMode)
    setIsActive(false)
    setTimeLeft(newMode === "work" ? 25 * 60 : 5 * 60)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  if (isCollapsed) {
    return (
      <div 
        className="flex flex-col items-center justify-center p-2 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-100 dark:border-blue-800/30 cursor-pointer hover:scale-105 transition-transform"
        onClick={toggleTimer}
        title={`Pomodoro: ${formatTime(timeLeft)}`}
      >
        <Timer className={`w-6 h-6 mb-1 ${isActive ? "text-blue-600 dark:text-blue-400 animate-pulse" : "text-gray-500"}`} />
        <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">
          {formatTime(timeLeft)}
        </span>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center relative overflow-hidden group">
      {/* Subtle background gradient accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-80" />
      
      <div className="flex items-center gap-1.5 mb-3 text-gray-500 dark:text-gray-400 self-start mt-1">
        <Timer className={`w-4 h-4 ${isActive ? "text-blue-500 animate-pulse" : ""}`} />
        <span className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Pomodoro</span>
      </div>

      <div className="flex space-x-1 mb-4 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg w-full relative z-10">
        <button
          onClick={() => switchMode("work")}
          className={`flex-1 py-1 text-xs font-medium rounded-md transition-all ${
            mode === "work"
              ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm font-bold"
              : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Work
        </button>
        <button
          onClick={() => switchMode("break")}
          className={`flex-1 py-1 text-xs font-medium rounded-md transition-all ${
            mode === "break"
              ? "bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm font-bold"
              : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Break
        </button>
      </div>

      <div className="text-4xl font-light tabular-nums text-gray-900 dark:text-white mb-5 tracking-tight">
        {formatTime(timeLeft)}
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={toggleTimer}
          className={`w-10 h-10 flex items-center justify-center rounded-full text-white shadow-md transition-all hover:scale-105 ${
            isActive ? "bg-amber-500 hover:bg-amber-600" : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          }`}
        >
          {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>
        <button
          onClick={resetTimer}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
