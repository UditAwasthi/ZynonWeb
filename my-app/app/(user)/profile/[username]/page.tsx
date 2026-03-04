"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

const API_BASE = "https://zynon.onrender.com/api"

export default function PublicProfilePage() {
    const router = useRouter()
    const { username } = useParams() as { username: string }
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const token = localStorage.getItem("accessToken")

                /* 1️⃣ REDIRECT IF SELF */
                if (token) {
                    const myRes = await fetch(`${API_BASE}/profile/me`, {
                        headers: { Authorization: `Bearer ${token}` },
                        credentials: "include"
                    })
                    if (myRes.ok) {
                        const myData = await myRes.json()
                        if (myData.data.user.username === username) {
                            router.replace("/profile")
                            return
                        }
                    }
                }

                /* 2️⃣ FETCH PUBLIC PROFILE */
                const res = await fetch(`${API_BASE}/profile/${username}`)
                const data = await res.json()
                if (!res.ok) throw new Error(data.message || "User not found")
                setProfile(data.data)

            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        loadProfile()
    }, [username, router])

    if (loading) return <LoadingState />
    if (!profile) return <NotFoundState />

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
            {/* Top Navigation Bar (Mobile) */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-4 h-14 border-b border-zinc-100 dark:border-zinc-900 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md md:hidden">
                <button onClick={() => router.back()} className="p-2">
                    <BackIcon />
                </button>
                <span className="font-bold tracking-tight">{profile.user.username}</span>
                <div className="w-8" /> {/* Spacer */}
            </div>

            <main className="max-w-4xl mx-auto py-8 px-4 md:px-8">

                {/* Header Section */}
                <header className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-20 mb-12">
                    {/* Profile Picture */}
                    <div className="w-24 h-24 md:w-36 md:h-36 rounded-full overflow-hidden ring-4 ring-zinc-50 dark:ring-zinc-900">
                        <img
                            src={profile.profilePicture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=500&q=80"}
                            alt={profile.user.username}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1 space-y-5 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <h1 className="text-2xl font-light">{profile.user.username}</h1>
                            <div className="flex gap-2 justify-center">
                                <button className="px-6 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-sm font-semibold hover:opacity-90 transition">
                                    Follow
                                </button>
                                <button className="px-4 py-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-lg text-sm font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-800 transition">
                                    Message
                                </button>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex justify-center md:justify-start gap-8 border-y md:border-none py-3 border-zinc-100 dark:border-zinc-900">
                            <Stat number={profile.postsCount || 0} label="posts" />
                            <Stat number={profile.followersCount || 0} label="followers" />
                            <Stat number={profile.followingCount || 0} label="following" />
                        </div>

                        {/* Bio */}
                        <div className="max-w-md">
                            <p className="font-bold text-sm mb-1">{profile.name || profile.user.username}</p>
                            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                                {profile.bio || "No bio yet"}
                            </p>
                        </div>
                    </div>
                </header>

                <hr className="border-zinc-100 dark:border-zinc-900 mb-8" />

                {/* Content Grid (Empty State Design) */}
                <div className="flex flex-col items-center py-20 text-zinc-400">
                    <div className="w-16 h-16 border-2 border-zinc-200 dark:border-zinc-800 rounded-full flex items-center justify-center mb-4">
                        <CameraIcon />
                    </div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">No Posts Yet</h2>
                    <p className="text-sm">When {profile.user.username} posts, you'll see them here.</p>
                </div>
            </main>
        </div>
    )
}

/* HELPER COMPONENTS */

function Stat({ number, label }: { number: number; label: string }) {
    return (
        <div className="flex flex-col md:flex-row md:gap-1 items-center">
            <span className="font-bold">{number}</span>
            <span className="text-zinc-500 text-sm">{label}</span>
        </div>
    )
}

function LoadingState() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
            <div className="w-10 h-10 border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100 rounded-full animate-spin" />
        </div>
    )
}

function NotFoundState() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
            <h2 className="text-2xl font-bold">Sorry, this page isn't available.</h2>
            <p className="text-zinc-500">The link you followed may be broken, or the page may have been removed.</p>
            <a href="/" className="text-blue-500 font-semibold">Go back to Home</a>
        </div>
    )
}

/* ICONS */

const BackIcon = () => (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
)

const CameraIcon = () => (
    <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <path d="M15 12.75a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
)