"use client"

import { useEffect } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Moon, Sun, User, Trash2, Github, Globe, Palette } from "lucide-react"

// Mock components if you don't have them in @/components/ui
// If you have shadcn/ui Switch, import it instead: import { Switch } from "@/components/ui/switch"
function Switch({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (c: boolean) => void }) {
  return (
    <button
      onClick={() => onCheckedChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
        checked ? "bg-primary" : "bg-input"
      }`}
    >
      <span
        className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  )
}

function Separator() {
  return <div className="h-[1px] w-full bg-border/50 my-4" />
}

export function SettingsPage({ darkMode, setDarkMode }: { darkMode: boolean; setDarkMode: (value: boolean) => void }) {
  const [username, setUsername] = useLocalStorage("user-name", "Josiah Lamuel")

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  const handleClearData = () => {
    if (confirm("Are you sure? This will reset your links and notes.")) {
      localStorage.clear()
      window.location.reload()
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your preferences and app data.</p>
      </div>

      <div className="grid gap-6">
        {/* --- APPEARANCE SECTION --- */}
        <Card className="border border-white/5 bg-secondary/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-blue-400" />
              <CardTitle>Appearance</CardTitle>
            </div>
            <CardDescription>Customize the look and feel of your dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Switch between light and dark themes.</p>
              </div>
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-muted-foreground" />
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                <Moon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <Separator />

            {/* Accent Color (Placeholder for now) */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Accent Color</Label>
                <p className="text-sm text-muted-foreground">Select your preferred color theme.</p>
              </div>
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-500 cursor-pointer ring-2 ring-offset-2 ring-offset-background ring-blue-500"></div>
                <div className="w-6 h-6 rounded-full bg-purple-500 cursor-pointer opacity-50"></div>
                <div className="w-6 h-6 rounded-full bg-green-500 cursor-pointer opacity-50"></div>
                <div className="w-6 h-6 rounded-full bg-orange-500 cursor-pointer opacity-50"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* --- GENERAL SECTION --- */}
        <Card className="border border-white/5 bg-secondary/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-purple-400" />
              <CardTitle>General</CardTitle>
            </div>
            <CardDescription>Update your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-secondary/20 border-white/10"
              />
            </div>

            {/* Notifications Placeholder */}
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive alerts for deadlines (Coming Soon).</p>
              </div>
              <Switch checked={false} onCheckedChange={() => {}} />
            </div>
          </CardContent>
        </Card>

        {/* --- DATA SECTION --- */}
        <Card className="border border-red-500/20 bg-red-500/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-400" />
              <CardTitle className="text-red-400">Danger Zone</CardTitle>
            </div>
            <CardDescription>Manage your data storage.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Clear All Data</Label>
                <p className="text-sm text-muted-foreground">Reset links, notes, and tasks to default.</p>
              </div>
              <Button variant="destructive" size="sm" onClick={handleClearData}>
                Reset Everything
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* --- ABOUT SECTION --- */}
        <div className="text-center space-y-4 pt-4">
          <p className="text-sm text-muted-foreground">Productivity Dashboard v1.0.0</p>
          <div className="flex justify-center gap-4">
            <a
              href="https://github.com/Josiah44123"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://josiahrosell.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Globe className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
