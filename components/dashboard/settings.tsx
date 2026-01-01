"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useEffect } from "react"

export function SettingsPage() {
  const [darkMode, setDarkMode] = useLocalStorage("dark-mode", true)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-muted-foreground mt-2">Personalize your productivity dashboard</p>
      </div>

      <Card className="border-2 border-blue-500/30 glow-card">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how your dashboard looks (di pa nagana) </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon className="w-5 h-5 text-purple-400" /> : <Sun className="w-5 h-5 text-yellow-400" />}
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-muted-foreground">{darkMode ? "Enabled" : "Disabled"}</p>
              </div>
            </div>
            <Button onClick={toggleDarkMode} variant={darkMode ? "default" : "outline"} className="gap-2">
              {darkMode ? "Disable" : "Enable"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-purple-500/30 glow-card">
        <CardHeader>
          <CardTitle>About</CardTitle>
          <CardDescription>Dashboard information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <p className="text-sm font-medium">Productivity Dashboard</p>
            <p className="text-xs text-muted-foreground">Version 1.0.0</p>
          </div>
          <div>
            <p className="text-sm font-medium">Portfolio</p>
            <a
              href="https://josiahrosell.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline"
            >
              josiahrosell.vercel.app
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
