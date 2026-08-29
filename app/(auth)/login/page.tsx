"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Sparkles } from "lucide-react"

// The login page handles user authentication via NextAuth
export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    })

    if (res?.error) {
      setError(res.error)
      setLoading(false)
    } else {
      router.push("/")
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-white dark:bg-slate-950 px-4">
      {/* Colorful Background Blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/20 blur-[100px] pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-amber-500/10 blur-[80px] pointer-events-none" />

      <div className="max-w-md w-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/20 dark:border-slate-800/50 relative z-10">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center mb-4 shadow-md">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-amber-500 bg-clip-text text-transparent">
            Welcome back
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">
            Sign in to access your Productivity Hub
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-6 font-medium border border-red-100 dark:border-red-900/50">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all disabled:opacity-50 mt-4 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-slate-600 dark:text-slate-400">
          Don't have an account?{" "}
          <Link href="/register" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-bold transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
