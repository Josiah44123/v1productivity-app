"use client"

import { useEffect, useState } from "react"

interface InteractiveBackgroundProps {
  darkMode: boolean
}

export function InteractiveBackground({ darkMode }: InteractiveBackgroundProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [glowPosition, setGlowPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
      setGlowPosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div className={`interactive-background ${!darkMode ? "light-mode" : ""}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-900 to-purple-900 dark:from-slate-950 dark:via-blue-900 dark:to-purple-900 light-mode:from-slate-50 light-mode:via-blue-100 light-mode:to-purple-100" />

      <div className="absolute inset-0 opacity-30">
        <svg className="w-full h-full" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="mesh1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="mesh2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#mesh1)" />
          <rect width="100%" height="100%" fill="url(#mesh2)" opacity="0.5" />
        </svg>
      </div>

      <div
        className="bg-orb orb-blue-new"
        style={{
          transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
        }}
      />
      <div
        className="bg-orb orb-purple-new"
        style={{
          transform: `translate(${mousePosition.x * -0.015}px, ${mousePosition.y * -0.015}px)`,
        }}
      />
      <div
        className="bg-orb orb-indigo-new"
        style={{
          transform: `translate(${mousePosition.x * 0.025}px, ${mousePosition.y * 0.025}px)`,
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-blue-600/5 pointer-events-none dark:from-blue-600/8 dark:via-purple-600/8 dark:to-blue-600/8" />

      <div
        className="pointer-events-none fixed w-32 h-32 rounded-full"
        style={{
          left: glowPosition.x - 64,
          top: glowPosition.y - 64,
          background:
            "radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, rgba(139, 92, 246, 0.06) 50%, transparent 100%)",
          boxShadow: "0 0 40px rgba(59, 130, 246, 0.15), inset 0 0 40px rgba(139, 92, 246, 0.08)",
          filter: "blur(20px)",
          transition: "all 0.1s ease-out",
        }}
      />

      <svg className="absolute inset-0 w-full h-full opacity-5 dark:opacity-10" preserveAspectRatio="none">
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  )
}
