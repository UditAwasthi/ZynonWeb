"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function resetPasswordPage() {
  const router = useRouter()

  // State Management
  const [step, setStep] = useState(1) // 1: Request OTP, 2: Submit OTP & New Password
  const [focused, setFocused] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  // Form Fields
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")

  // Step 1: Send OTP to Email
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("https://zynon.onrender.com/api/auth/forgot-password", { // Add your path here
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to send OTP")

      setMessage("OTP sent to your email.")
      setStep(2)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Reset Password with OTP
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("https://zynon.onrender.com/api/auth/reset-password", { // Add your path here
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Reset failed")
      }

      router.push("/login")
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
        backgroundColor: '#000',
        background: `radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 40%),
                     radial-gradient(circle at 20% 80%, rgba(168, 85, 247, 0.15) 0%, transparent 40%)`,
        fontFamily: 'SF Pro Display, Inter, system-ui, sans-serif',
      }}
    >
      <div className="w-full max-w-[400px] rounded-[38px] border border-white/10 bg-white/[0.03] p-10 shadow-2xl backdrop-blur-[40px] backdrop-saturate-[180%]">
        
        <div className="mb-10 text-center">
          <h1 className="bg-gradient-to-b from-white to-white/50 bg-clip-text text-4xl font-bold tracking-tighter text-transparent">
            {step === 1 ? "Reset Access" : "Create New Password"}
          </h1>
          <p className="mt-2 text-base text-white/50">
            {step === 1 
              ? "Enter your email to receive a code." 
              : "Check your inbox for the verification code."}
          </p>
        </div>

        {message && !error && (
          <div className="mb-6 rounded-xl bg-emerald-500/10 p-3 text-center text-xs font-medium text-emerald-400 border border-emerald-500/20">
            {message}
          </div>
        )}

        <form className="space-y-3" onSubmit={step === 1 ? handleRequestOtp : handleResetPassword}>
          {/* Email Field (Always visible or readonly in step 2) */}
          <div className="relative">
            <input
              type="email"
              value={email}
              readOnly={step === 2}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused(null)}
              className={`w-full rounded-[20px] border px-5 py-4 text-sm text-white outline-none transition-all duration-300 ${
                focused === 'email' ? 'border-white/30 bg-white/10' : 'border-white/5 bg-white/5'
              } ${step === 2 ? 'opacity-50 cursor-not-allowed' : ''}`}
              placeholder="Email address"
              required
            />
          </div>

          {/* Step 2 Specific Fields */}
          {step === 2 && (
            <>
              <div className="relative">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  onFocus={() => setFocused('otp')}
                  onBlur={() => setFocused(null)}
                  className={`w-full tracking-[0.5em] text-center rounded-[20px] border px-5 py-4 text-sm text-white outline-none transition-all duration-300 ${
                    focused === 'otp' ? 'border-white/30 bg-white/10' : 'border-white/5 bg-white/5'
                  }`}
                  placeholder="CODE"
                  required
                />
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onFocus={() => setFocused('newPass')}
                  onBlur={() => setFocused(null)}
                  className={`w-full rounded-[20px] border px-5 py-4 text-sm text-white outline-none transition-all duration-300 ${
                    focused === 'newPass' ? 'border-white/30 bg-white/10' : 'border-white/5 bg-white/5'
                  }`}
                  placeholder="New Password"
                  required
                />
              </div>
            </>
          )}

          {error && (
            <p className="text-sm text-red-400 px-2">{error}</p>
          )}

          <button
            disabled={loading}
            className="mt-4 w-full rounded-[20px] bg-white py-4 text-base font-semibold text-black transition-all active:scale-[0.96] hover:bg-neutral-200 disabled:opacity-60"
          >
            {loading ? "Processing..." : step === 1 ? "Send Code" : "Update Password"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-white/40">
          Remembered your password?{" "}
          <Link href="/login" className="font-medium text-white hover:underline">
            Go back
          </Link>
        </div>
      </div>
    </div>
  )
}