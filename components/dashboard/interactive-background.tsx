"use client"

import { useEffect, useRef } from "react"

interface InteractiveBackgroundProps {
  darkMode: boolean
}

export function InteractiveBackground({ darkMode }: InteractiveBackgroundProps) {
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        // MATH FIX: 
        // Mouse Position (e.clientX) - Half Size (150px) = Perfect Center
        const x = e.clientX - 150
        const y = e.clientY - 150
        cursorRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#020617]">
      {/* 1. Base Dark Background (Opacity 30%) */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e1b4b] opacity-30" />

      {/* 2. The Grid */}
      <div 
        className="fixed inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(#334155 1px, transparent 1px), linear-gradient(to right, #334155 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* 3. The GLOW */}
      <div
        ref={cursorRef}
        className="absolute top-0 left-0 rounded-full will-change-transform"
        style={{
          width: "300px",   // Explicit size
          height: "300px",  // Explicit size
          background: "radial-gradient(circle, rgba(147, 51, 234, 0.15) 0%, rgba(79, 70, 229, 0.05) 50%, transparent 70%)",
          filter: "blur(40px)",
          mixBlendMode: "screen",
        }}
      />
    </div>
  )
}