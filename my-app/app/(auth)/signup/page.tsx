"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
export default function SignupPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [focused, setFocused] = useState<string | null>(null)

    const styles = {
        container: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            backgroundColor: '#000',
            // Animated Mesh Gradient (Android 16 vibe)
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
            borderRadius: '38px', // Ultra-rounded Android 16 style
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
        },
        footerText: {
            marginTop: '24px',
            textAlign: 'center' as const,
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.4)',
        }
    }

    return (
        <div style={styles.container}>
            <div style={styles.glassCard}>
                <div style={styles.header}>
                    <h1 style={styles.title}>Zynon</h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px' }}>Create your universe.</p>
                </div>

                <button
                    style={styles.googleBtn}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" />
                    </svg>
                    Sign up with Google
                </button>

                <div style={styles.divider}>
                    <div style={styles.line}></div>
                    <span>OR</span>
                    <div style={styles.line}></div>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); setLoading(true); }}>
                    <div style={styles.inputWrapper}>
                        <input
                            style={styles.input(focused === 'user')}
                            placeholder="Username"
                            onFocus={() => setFocused('user')}
                            onBlur={() => setFocused(null)}
                        />
                    </div>
                    <div style={styles.inputWrapper}>
                        <input
                            style={styles.input(focused === 'email')}
                            placeholder="Email address"
                            onFocus={() => setFocused('email')}
                            onBlur={() => setFocused(null)}
                        />
                    </div>
                    <div style={styles.inputWrapper}>
                        <input
                            type="password"
                            style={styles.input(focused === 'pass')}
                            placeholder="Password"
                            onFocus={() => setFocused('pass')}
                            onBlur={() => setFocused(null)}
                        />
                    </div>

                    <button
                        style={styles.submitBtn}
                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.96)'}
                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
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