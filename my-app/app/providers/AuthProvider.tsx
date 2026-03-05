"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { setAccessToken } from "@/lib/api"

type AuthState = "loading" | "authenticated" | "unauthenticated"

const AuthContext = createContext<{
  authState: AuthState
  setToken: (token: string) => void
} | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {

  const [authState, setAuthState] = useState<AuthState>("loading")

  const setToken = (token: string) => {
    setAccessToken(token)
    // keep a copy in localStorage so client-side guards can read it
    try {
      localStorage.setItem("accessToken", token)
    } catch {
      // storage could fail (e.g. Safari private mode), but we still set the state
    }
    setAuthState("authenticated")
  }

  useEffect(() => {

    async function restoreSession() {

      try {

        const res = await fetch(
          "https://zynon.onrender.com/api/auth/refresh",
          {
            method: "POST",
            credentials: "include",
            headers: {
              "x-client-type": "web"
            }
          }
        )

        if (!res.ok) {
          setAuthState("unauthenticated")
          return
        }

        const data = await res.json()

        setAccessToken(data.data.accessToken)
        // persist refreshed token too
        try {
          localStorage.setItem("accessToken", data.data.accessToken)
        } catch {}
        setAuthState("authenticated")

      } catch {
        setAuthState("unauthenticated")
      }

    }

    restoreSession()

  }, [])

  return (
    <AuthContext.Provider value={{ authState, setToken }}>
      {authState === "loading"
        ? (
          <div className="flex min-h-screen items-center justify-center bg-black text-white">
            Loading...
          </div>
        )
        : children
      }
    </AuthContext.Provider>
  )
}