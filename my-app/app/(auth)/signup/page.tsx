"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function SignupPage() {
    const router = useRouter()

    const [loading, setLoading] = useState(false)
    const [focused, setFocused] = useState<string | null>(null)

    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")

    const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
        // 1️⃣ create user
        const signupRes = await fetch("https://zynon.onrender.com/api/auth/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-client-type": "web"
            },
            body: JSON.stringify({
                username,
                email,
                password
            })
        })

        const signupData = await signupRes.json()

        if (!signupRes.ok) {
            throw new Error(signupData.message || "Signup failed")
        }

        // 2️⃣ send verification email
        const otpRes = await fetch("https://zynon.onrender.com/api/auth/send-email-verification", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
        })

        const otpData = await otpRes.json()

        if (!otpRes.ok) {
            throw new Error(otpData.message || "Failed to send verification email")
        }

        // 3️⃣ store email temporarily for verify page
        sessionStorage.setItem("verifyEmail", email)

        // 4️⃣ redirect to verify page
        router.push("/verifyEmail")

    } catch (err: any) {
        setError(err.message)
    } finally {
        setLoading(false)
    }
}

    const styles = {
        container: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            backgroundColor: '#000',
            background: `radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 40%),
                         radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.15) 0%, transparent 40%)`,
            fontFamily: 'SF Pro Display, Inter, system-ui, sans-serif',
            color: '#fff',
            overflow: 'hidden',
        },
        glassCard: {
            width: '100%',
            maxWidth: '400px',
            padding: '40px',
            borderRadius: '38px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
            position: 'relative' as const,
        },
        header: {
            textAlign: 'center' as const,
            marginBottom: '32px',
        },
        title: {
            fontSize: '32px',
            fontWeight: 700,
            letterSpacing: '-0.04em',
            marginBottom: '8px',
            background: 'linear-gradient(to bottom, #fff, #888)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
        },
        googleBtn: {
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '14px',
            borderRadius: '18px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            color: '#fff',
            fontSize: '15px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
        },
        divider: {
            display: 'flex',
            alignItems: 'center',
            margin: '24px 0',
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.3)',
            gap: '10px',
        },
        line: {
            flex: 1,
            height: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
        },
        inputWrapper: {
            position: 'relative' as const,
            marginBottom: '12px',
        },
        input: (isFocused: boolean) => ({
            width: '100%',
            padding: '18px 20px',
            fontSize: '16px',
            backgroundColor: isFocused ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.04)',
            border: '1px solid',
            borderColor: isFocused ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.05)',
            borderRadius: '20px',
            color: '#fff',
            outline: 'none',
            transition: 'all 0.3s ease',
            boxSizing: 'border-box' as const,
        }),
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
            cursor: 'pointer',
            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }
    }

    return (
        <div style={styles.container}>
            <div style={styles.glassCard}>
                <div style={styles.header}>
                    <h1 style={styles.title}>Zynon</h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px' }}>Create your universe.</p>
                </div>

                <div style={styles.divider}>
                    <div style={styles.line}></div>
                    <span>OR</span>
                    <div style={styles.line}></div>
                </div>

                <form onSubmit={handleSignup}>
                    <div style={styles.inputWrapper}>
                        <input
                            style={styles.input(focused === 'user')}
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onFocus={() => setFocused('user')}
                            onBlur={() => setFocused(null)}
                            required
                        />
                    </div>

                    <div style={styles.inputWrapper}>
                        <input
                            style={styles.input(focused === 'email')}
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onFocus={() => setFocused('email')}
                            onBlur={() => setFocused(null)}
                            required
                        />
                    </div>

                    <div style={styles.inputWrapper}>
                        <input
                            type="password"
                            style={styles.input(focused === 'pass')}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setFocused('pass')}
                            onBlur={() => setFocused(null)}
                            required
                        />
                    </div>

                    {error && (
                        <p style={{ color: "#ff6b6b", fontSize: "14px", marginTop: "10px" }}>
                            {error}
                        </p>
                    )}

                    <button style={styles.submitBtn}>
                        {loading ? 'Joining...' : 'Get Started'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-white/40">
                    Already part of the universe?{' '}
                    <Link href="/login" className="font-medium text-white hover:underline">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    )
}