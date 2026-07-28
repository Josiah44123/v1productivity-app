"use client"

import { useEffect, useRef } from "react"

interface InteractiveBackgroundProps {
  darkMode?: boolean
}

export function InteractiveBackground({ darkMode = false }: InteractiveBackgroundProps) {
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        const x = e.clientX - 150
        const y = e.clientY - 150
        cursorRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div className={`fixed inset-0 pointer-events-none -z-10 overflow-hidden transition-colors duration-500 ${
      darkMode ? "bg-[#020617]" : "bg-slate-50"
    }`}>
      {/* 1. Base Background */}
      <div className={`absolute inset-0 transition-opacity duration-500 ${
        darkMode
          ? "bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e1b4b] opacity-30"
          : "bg-gradient-to-br from-slate-50 via-blue-50/30 to-amber-50/20 opacity-80"
      }`} />

      {/* 2. The Grid */}
      <div 
        className={`fixed inset-0 ${darkMode ? "opacity-20" : "opacity-10"}`}
        style={{
          backgroundImage: darkMode 
            ? `linear-gradient(#334155 1px, transparent 1px), linear-gradient(to right, #334155 1px, transparent 1px)`
            : `linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(to right, #cbd5e1 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* 3. Soft Cursor Glow */}
      <div
        ref={cursorRef}
        className="absolute top-0 left-0 rounded-full will-change-transform"
        style={{
          width: "300px",
          height: "300px",
          background: darkMode
            ? "radial-gradient(circle, rgba(147, 51, 234, 0.15) 0%, rgba(79, 70, 229, 0.05) 50%, transparent 70%)"
            : "radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(249, 115, 22, 0.05) 50%, transparent 70%)",
          filter: "blur(40px)",
          mixBlendMode: darkMode ? "screen" : "normal",
        }}
      />
    </div>
  )
}