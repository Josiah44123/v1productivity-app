"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Zap } from "lucide-react"

interface MiniGameProps {
  activeTab?: string
}

export function MiniGame({ activeTab }: MiniGameProps) {
  const [isActive, setIsActive] = useState(false)
  const [clicks, setClicks] = useState(0)
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([])
  const [pageFlash, setPageFlash] = useState(false)

  const animations: Record<string, { bgClass: string; glow: string }> = {
    home: { bgClass: "from-blue-600 to-cyan-600", glow: "shadow-blue-500/50" },
    tasks: { bgClass: "from-purple-600 to-pink-600", glow: "shadow-purple-500/50" },
    calendar: { bgClass: "from-orange-600 to-red-600", glow: "shadow-orange-500/50" },
    notes: { bgClass: "from-green-600 to-emerald-600", glow: "shadow-green-500/50" },
    links: { bgClass: "from-yellow-600 to-orange-600", glow: "shadow-yellow-500/50" },
    progress: { bgClass: "from-pink-600 to-rose-600", glow: "shadow-pink-500/50" },
    settings: { bgClass: "from-indigo-600 to-purple-600", glow: "shadow-indigo-500/50" },
  }

  const currentAnimation = animations[activeTab || "home"] || animations.home

  const handleClick = (e: React.MouseEvent) => {
    setClicks((prev) => prev + 1)
    setPageFlash(true)

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newParticle = {
      id: Date.now(),
      x,
      y,
    }

    setParticles((prev) => [...prev, newParticle])

    setTimeout(() => {
      setPageFlash(false)
    }, 400)

    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== newParticle.id))
    }, 600)
  }

  useEffect(() => {
    if (clicks > 0) {
      setIsActive(true)
      const timer = setTimeout(() => setIsActive(false), 500)
      return () => clearTimeout(timer)
    }
  }, [clicks])

  return (
    <div className="relative">
      {pageFlash && (
        <div
          className={`fixed inset-0 pointer-events-none z-50 bg-gradient-to-br ${currentAnimation.bgClass} opacity-20 animate-pulse`}
          style={{ animation: "fadeOut 0.4s ease-out forwards" }}
        />
      )}

      <button
        onClick={handleClick}
        className={`relative w-10 h-10 rounded-lg border transition-all duration-300 flex items-center justify-center overflow-hidden group ${
          isActive
            ? `border-accent/50 bg-gradient-to-br ${currentAnimation.bgClass} shadow-lg ${currentAnimation.glow}`
            : "border-border/40 bg-card/50 hover:border-accent/30"
        }`}
        title="Click to light up the page!"
      >
        <Zap className={`w-5 h-5 transition-all ${isActive ? "text-white scale-110" : "text-blue-400"}`} />

        {/* Particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute pointer-events-none"
            style={{
              left: particle.x,
              top: particle.y,
              animation: `sparkle 0.6s ease-out forwards`,
            }}
          >
            <div className="w-2 h-2 bg-blue-400 rounded-full" />
          </div>
        ))}

        {/* Score tooltip */}
        {clicks > 0 && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-bold text-blue-300 whitespace-nowrap animate-pulse">
            +{clicks}
          </div>
        )}
      </button>

      <style jsx>{`
        @keyframes sparkle {
          0% {
            opacity: 1;
            transform: translate(0, 0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(var(--tx, 0px), var(--ty, -20px)) scale(0);
          }
        }

        @keyframes fadeOut {
          0% {
            opacity: 0.2;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
