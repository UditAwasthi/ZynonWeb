"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/providers/AuthProvider"

export default function LoginPage() {

  const router = useRouter()

  const { setToken } = useAuth()   // ✅ hook at top level

  const [focused, setFocused] = useState<string | null>(null)
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    setError("")
    setLoading(true)

    try {

      const res = await fetch(
        "https://zynon.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-client-type": "web"
          },
          credentials: "include",
          body: JSON.stringify({
            identifier,
            password
          })
        }
      )

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Login failed")
      }

      // store access token
      setToken(data.data.accessToken)

      router.push("/home")

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  return (
    <div
      className="flex min-h-screen items-center justify-center p-6 transition-all duration-500"
      style={{
        backgroundColor: "#000",
        background: `radial-gradient(circle at 80% 20%, rgba(99,102,241,0.15) 0%, transparent 40%),
                     radial-gradient(circle at 20% 80%, rgba(168,85,247,0.15) 0%, transparent 40%)`,
        fontFamily: "SF Pro Display, Inter, system-ui, sans-serif"
      }}
    >
      <div className="w-full max-w-[400px] rounded-[38px] border border-white/10 bg-white/[0.03] p-10 shadow-2xl backdrop-blur-[40px] backdrop-saturate-[180%]">

        <div className="mb-10 text-center">
          <h1 className="bg-gradient-to-b from-white to-white/50 bg-clip-text text-4xl font-bold tracking-tighter text-transparent">
            Zynon
          </h1>
          <p className="mt-2 text-base text-white/50">
            Welcome back to the universe.
          </p>
        </div>

        {/* Google SSO */}
        <button className="flex w-full items-center justify-center gap-3 rounded-[18px] border border-white/10 bg-white/5 py-3.5 text-sm font-medium text-white transition-all hover:bg-white/10 active:scale-[0.98]">
          Continue with Google
        </button>

        <div className="my-8 flex items-center gap-3 text-[10px] font-bold tracking-widest text-white/20">
          <div className="h-px flex-1 bg-white/5" />
          OR
          <div className="h-px flex-1 bg-white/5" />
        </div>

        <form className="space-y-3" onSubmit={handleLogin}>
          <div className="relative">
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              onFocus={() => setFocused("identifier")}
              onBlur={() => setFocused(null)}
              className={`w-full rounded-[20px] border px-5 py-4 text-sm text-white outline-none transition-all duration-300 ${focused === "identifier"
                  ? "border-white/30 bg-white/10"
                  : "border-white/5 bg-white/5"
                }`}
              placeholder="Email address or username"
              required
            />
          </div>

          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocused("pass")}
              onBlur={() => setFocused(null)}
              className={`w-full rounded-[20px] border px-5 py-4 text-sm text-white outline-none transition-all duration-300 ${focused === "pass"
                  ? "border-white/30 bg-white/10"
                  : "border-white/5 bg-white/5"
                }`}
              placeholder="Password"
              required
            />
          </div>

          <div className="flex justify-end px-1">
            <Link
              href="/resetPassword"
              className="text-xs font-medium text-white/40 transition-colors hover:text-white"
            >
              Forgot password?
            </Link>
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            disabled={loading}
            className="mt-4 w-full rounded-[20px] bg-white py-4 text-base font-semibold text-black transition-all active:scale-[0.96] hover:bg-neutral-200 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-white/40">
          Not part of the universe?{" "}
          <Link href="/signup" className="font-medium text-white hover:underline">
            Join now
          </Link>
        </div>
      </div>
    </div>
  )
}