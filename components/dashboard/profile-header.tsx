"use client"

import { Github, Linkedin, Twitter } from "lucide-react"
import { MiniGame } from "./mini-game"

interface ProfileHeaderProps {
  darkMode: boolean
  setDarkMode: (value: boolean) => void
  activeTab?: string
}

export function ProfileHeader({ darkMode, setDarkMode, activeTab }: ProfileHeaderProps) {
  return (
    <div className="border-b border-border/40 bg-card/20 backdrop-blur-md sticky top-0 z-30 relative">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 flex-1">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-orange-500 p-0.5">
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                  <span className="text-xs font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    JR
                  </span>
                </div>
              </div>
              <div>
                <h2 className="font-semibold text-sm">Josiah Rosell</h2>
                <p className="text-xs text-muted-foreground">2nd Year '25-'26</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <a
                href="https://josiahrosell.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-3 py-1 rounded-full bg-card/50 border border-border/40 hover:glow-card transition-all"
              >
                Portfolio
              </a>
              <a href="#" className="p-1 hover:bg-card/50 rounded transition-colors">
                <Github className="w-4 h-4 text-muted-foreground hover:text-accent" />
              </a>
              <a href="#" className="p-1 hover:bg-card/50 rounded transition-colors">
                <Linkedin className="w-4 h-4 text-muted-foreground hover:text-primary" />
              </a>
              <a href="#" className="p-1 hover:bg-card/50 rounded transition-colors">
                <Twitter className="w-4 h-4 text-muted-foreground hover:text-blue-400" />
              </a>
            </div>
          </div>

          <MiniGame activeTab={activeTab} />
        </div>
      </div>
    </div>
  )
}
