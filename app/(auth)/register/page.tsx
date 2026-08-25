"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Sparkles, CheckCircle2, XCircle } from "lucide-react"

// The registration page handles new user account creation and validation
export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Strict regex validation for password
  const isLengthValid = password.length >= 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const isPasswordValid = isLengthValid && hasUpperCase && hasLowerCase && hasNumber

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!isPasswordValid) {
      setError("Please ensure your password meets all requirements.")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      if (res.ok) {
        router.push("/login")
      } else {
        const data = await res.json()
        setError(data.error || "Registration failed")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-white dark:bg-slate-950 px-4 py-8">
      {/* Colorful Background Blurs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-amber-500/15 blur-[100px] pointer-events-none" />
      <div className="absolute top-[30%] left-[20%] w-[25%] h-[25%] rounded-full bg-blue-500/15 blur-[80px] pointer-events-none" />

      <div className="max-w-md w-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/20 dark:border-slate-800/50 relative z-10">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-amber-500 flex items-center justify-center mb-4 shadow-md">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-amber-500 bg-clip-text text-transparent">
            Create an account
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">
            Join the Productivity Hub today
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-6 font-medium border border-red-100 dark:border-red-900/50">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Name</label>
            <input
              type="text"
              required
              placeholder="John Doe"
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
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
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 mb-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            {/* Password Validation Checklist */}
            <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800/30 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Password Requirements</p>
              <div className="flex items-center text-xs">
                {isLengthValid ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-2 flex-shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 mr-2 flex-shrink-0" />}
                <span className={isLengthValid ? "text-slate-700 dark:text-slate-300" : "text-slate-500"}>At least 8 characters</span>
              </div>
              <div className="flex items-center text-xs">
                {hasUpperCase ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-2 flex-shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 mr-2 flex-shrink-0" />}
                <span className={hasUpperCase ? "text-slate-700 dark:text-slate-300" : "text-slate-500"}>At least one uppercase letter</span>
              </div>
              <div className="flex items-center text-xs">
                {hasLowerCase ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-2 flex-shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 mr-2 flex-shrink-0" />}
                <span className={hasLowerCase ? "text-slate-700 dark:text-slate-300" : "text-slate-500"}>At least one lowercase letter</span>
              </div>
              <div className="flex items-center text-xs">
                {hasNumber ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-2 flex-shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 mr-2 flex-shrink-0" />}
                <span className={hasNumber ? "text-slate-700 dark:text-slate-300" : "text-slate-500"}>At least one number</span>
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading || !isPasswordValid}
            className="w-full bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 hover:to-amber-600 text-white font-semibold py-2.5 px-4 rounded-xl transition-all disabled:opacity-50 mt-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-bold transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
