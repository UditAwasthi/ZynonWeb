"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function VerifyEmailPage() {
    const router = useRouter()

    const [email, setEmail] = useState("")
    const [otp, setOtp] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    useEffect(() => {
        const storedEmail = sessionStorage.getItem("verifyEmail")
        if (!storedEmail) {
            router.push("/signup")
        } else {
            setEmail(storedEmail)
        }
    }, [])

    const verifyOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const res = await fetch("https://zynon.onrender.com/api/auth/verify-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    otp
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || "Verification failed")
            }

            setSuccess("Email verified successfully!")

            setTimeout(() => {
                router.push("/login")
            }, 1500)

        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const resendOtp = async () => {
        setError("")
        setSuccess("")

        try {
            const res = await fetch("https://zynon.onrender.com/api/auth/send-email-verification", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message)
            }

            setSuccess("OTP sent again!")

        } catch (err: any) {
            setError(err.message)
        }
    }

    const styles = {
        container: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            backgroundColor: '#000',
            background: `radial-gradient(circle at 20% 20%, rgba(99,102,241,0.15) 0%, transparent 40%),
                         radial-gradient(circle at 80% 80%, rgba(168,85,247,0.15) 0%, transparent 40%)`,
            fontFamily: 'SF Pro Display, Inter, system-ui, sans-serif',
            color: '#fff'
        },
        glassCard: {
            width: '100%',
            maxWidth: '400px',
            padding: '40px',
            borderRadius: '38px',
            backgroundColor: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(40px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 40px 100px rgba(0,0,0,0.8)'
        },
        header: {
            textAlign: 'center' as const,
            marginBottom: '30px'
        },
        title: {
            fontSize: '32px',
            fontWeight: 700,
            letterSpacing: '-0.04em',
            background: 'linear-gradient(to bottom,#fff,#888)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
        },
        subtitle: {
            marginTop: '8px',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '15px'
        },
        input: {
            width: '100%',
            padding: '18px',
            fontSize: '20px',
            letterSpacing: '8px',
            textAlign: 'center' as const,
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.1)',
            backgroundColor: 'rgba(255,255,255,0.05)',
            color: '#fff',
            outline: 'none'
        },
        submitBtn: {
            width: '100%',
            padding: '16px',
            marginTop: '20px',
            borderRadius: '20px',
            border: 'none',
            backgroundColor: '#fff',
            color: '#000',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer'
        },
        resend: {
            marginTop: '18px',
            textAlign: 'center' as const,
            fontSize: '14px',
            color: 'rgba(255,255,255,0.5)',
            cursor: 'pointer'
        }
    }

    return (
        <div style={styles.container}>
            <div style={styles.glassCard}>

                <div style={styles.header}>
                    <h1 style={styles.title}>Verify Email</h1>
                    <p style={styles.subtitle}>
                        Enter the code sent to {email}
                    </p>
                </div>

                <form onSubmit={verifyOtp}>
                    <input
                        style={styles.input}
                        maxLength={6}
                        placeholder="••••••"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                    />

                    {error && (
                        <p style={{ color: "#ff6b6b", marginTop: "10px", fontSize: "14px" }}>
                            {error}
                        </p>
                    )}

                    {success && (
                        <p style={{ color: "#4ade80", marginTop: "10px", fontSize: "14px" }}>
                            {success}
                        </p>
                    )}

                    <button style={styles.submitBtn}>
                        {loading ? "Verifying..." : "Verify Email"}
                    </button>
                </form>

                <div style={styles.resend} onClick={resendOtp}>
                    Didn't receive the code? Resend
                </div>

            </div>
        </div>
    )
}