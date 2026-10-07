"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Lock, User, Eye, EyeOff, Loader2 } from "lucide-react"

const ADMIN_USERNAME = "adminuser"
const ADMIN_PASSWORD = "Dollar123#"

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    startTransition(() => {
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Store session flag in sessionStorage (client-side only, no cookies needed for this demo)
        sessionStorage.setItem("tlg_admin_auth", "1")
        router.push("/admin/dashboard")
      } else {
        setError("Invalid username or password.")
      }
    })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 px-4">
      {/* Card */}
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-gray-900 p-8 shadow-2xl">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="relative size-14 overflow-hidden rounded-full ring-2 ring-rose-500 ring-offset-2 ring-offset-gray-900">
            <Image src="/images/logo.png" alt="Global Mail Express" fill className="object-cover" />
          </div>
          <div className="text-center">
            <h1 className="text-lg font-bold text-white">Global Mail Express</h1>
            <p className="text-sm text-gray-400">Admin Portal</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-9 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                placeholder="Enter username"
                autoComplete="username"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-500" />
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-9 pr-10 text-sm text-white placeholder-gray-500 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                placeholder="Enter password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-rose-600 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}
