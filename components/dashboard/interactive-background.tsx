"use client"

import { useEffect, useState } from "react"

export function InteractiveBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [binaryElements, setBinaryElements] = useState<Array<{ id: number; x: number; y: number; char: string }>>([])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  useEffect(() => {
    const generateBinary = () => {
      const newElements = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: mousePosition.x + (Math.random() - 0.5) * 200,
        y: mousePosition.y + (Math.random() - 0.5) * 200,
        char: Math.random() > 0.5 ? "1" : "0",
      }))
      setBinaryElements(newElements)
    }

    const interval = setInterval(generateBinary, 2000)
    generateBinary()

    return () => clearInterval(interval)
  }, [mousePosition])

  return (
    <div className="interactive-background">
      <div
        className="bg-orb orb-blue"
        style={{
          transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
        }}
      />
      <div
        className="bg-orb orb-orange"
        style={{
          transform: `translate(${mousePosition.x * -0.015}px, ${mousePosition.y * -0.015}px)`,
        }}
      />
      <div
        className="bg-orb orb-purple"
        style={{
          transform: `translate(${mousePosition.x * 0.025}px, ${mousePosition.y * 0.025}px)`,
        }}
      />

      {binaryElements.map((element) => (
        <div
          key={element.id}
          className="binary-element"
          style={{
            left: element.x,
            top: element.y,
            animation: `float-binary ${4 + Math.random() * 2}s ease-in-out infinite`,
          }}
        >
          {element.char}
        </div>
      ))}

      {/* Grid overlay for tech aesthetic */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/3 via-transparent to-purple-500/3 pointer-events-none" />

      {/* Animated grid lines */}
      <svg className="absolute inset-0 w-full h-full opacity-5" preserveAspectRatio="none">
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
