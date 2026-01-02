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
        // FAST: Moves the glow instantly without React re-renders
        const x = e.clientX
        const y = e.clientY
        // Center the 600px circle (subtract 300px)
        cursorRef.current.style.transform = `translate3d(${x - 300}px, ${y - 300}px, 0)`
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#020617]">
      {/* 1. Base Dark Background (Reduced Opacity to 30%) */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e1b4b] opacity-30" />

      {/* 2. The Grid (Fixed to cover whole screen) */}
      <div 
        className="fixed inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(#334155 1px, transparent 1px), linear-gradient(to right, #334155 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* 3. The GLOW - 600px wide, Screen Blend Mode for brightness */}
      <div
        ref={cursorRef}
        className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full will-change-transform"
        style={{
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(139, 92, 246, 0.15) 40%, transparent 70%)",
          filter: "blur(60px)",
          mixBlendMode: "screen",
        }}
      />
    </div>
  )
}