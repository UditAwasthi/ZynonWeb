"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
    ChevronLeft, MoreHorizontal, MessageCircle,
    UserPlus, Grid, Clapperboard, Camera,
    ShieldCheck, Link as LinkIcon
} from "lucide-react"

const API_BASE = "https://zynon.onrender.com/api"

export default function PublicProfilePage() {
    const router = useRouter()
    const { username } = useParams() as { username: string }
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("Posts")

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const token = localStorage.getItem("accessToken")

                // 1. Redirect if viewing own profile
                if (token) {
                    const myRes = await fetch(`${API_BASE}/profile/me`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                    if (myRes.ok) {
                        const myData = await myRes.json()
                        if (myData.data.user.username === username) {
                            router.replace("/profile")
                            return
                        }
                    }
                }

                // 2. Fetch public profile
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

    if (loading) return <LoadingSkeleton />
    if (!profile) return <ErrorState />

    const displayUsername = profile.user?.username || username

    return (
        <div className="min-h-screen bg-white dark:bg-[#080808] text-zinc-900 dark:text-zinc-100">
            {/* GLASS NAVBAR */}
            <nav className="sticky top-0 z-50 border-b border-zinc-100 dark:border-white/[0.06] bg-white/70 dark:bg-[#080808]/70 backdrop-blur-xl">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
                        >
                            <ChevronLeft size={22} />
                        </button>
                        <span className="font-bold text-lg tracking-tight lowercase">
                            {displayUsername}
                        </span>
                    </div>
                    <button className="p-2.5 rounded-xl bg-zinc-100 dark:bg-white/5 border border-transparent dark:border-white/10">
                        <MoreHorizontal size={20} />
                    </button>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto pt-10 pb-24 px-6">
                <section className="flex flex-col md:flex-row gap-10 items-center md:items-start mb-16">

                    {/* AVATAR DISPLAY */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative"
                    >
                        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-[40px] p-1 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 dark:from-white/10 dark:to-white/5 ring-1 ring-zinc-200 dark:ring-white/10 shadow-2xl">
                            <div className="w-full h-full rounded-[36px] overflow-hidden bg-white dark:bg-zinc-900">
                                <img
                                    src={profile.profilePicture || `https://ui-avatars.com/api/?name=${displayUsername}&background=random`}
                                    className="w-full h-full object-cover"
                                    alt={displayUsername}
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* PROFILE INFO */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1 space-y-8 text-center md:text-left"
                    >
                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                            <div className="flex items-center justify-center md:justify-start gap-2">
                                <h2 className="text-3xl font-black tracking-tighter">{displayUsername}</h2>
                                <ShieldCheck size={20} className="text-blue-500" fill="currentColor" />
                            </div>

                            <div className="flex gap-3 justify-center">
                                <button className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-transform">
                                    <UserPlus size={16} strokeWidth={3} /> Follow
                                </button>
                                <button className="p-2.5 bg-zinc-100 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/10 active:scale-95 transition-transform">
                                    <MessageCircle size={20} />
                                </button>
                            </div>
                        </div>

                        {/* STATS */}
                        <div className="flex justify-center md:justify-start gap-1">
                            <Stat number={profile.postsCount || 0} label="posts" />
                            <div className="w-px h-8 self-center bg-zinc-200 dark:bg-white/10 mx-5 md:mx-7" />
                            <Stat number={profile.followersCount || 0} label="followers" />
                            <div className="w-px h-8 self-center bg-zinc-200 dark:bg-white/10 mx-5 md:mx-7" />
                            <Stat number={profile.followingCount || 0} label="following" />
                        </div>

                        {/* BIO CARD */}
                        <div className="max-w-md mx-auto md:mx-0 bg-zinc-50 dark:bg-white/[0.02] p-5 rounded-3xl border border-zinc-100 dark:border-white/5 text-left">
                            <p className="font-bold text-sm mb-1.5 uppercase tracking-widest text-zinc-400">{profile.name || displayUsername}</p>
                            <p className="text-[15px] leading-relaxed opacity-80 whitespace-pre-wrap">
                                {profile.bio || "This user is still exploring Zynon."}
                            </p>
                            {profile.website && (
                                <a href={profile.website} target="_blank" className="inline-flex items-center gap-2 text-blue-500 text-sm font-bold mt-4">
                                    <LinkIcon size={14} /> {profile.website.replace(/(^\w+:|^)\/\//, '')}
                                </a>
                            )}
                        </div>
                    </motion.div>
                </section>

                {/* CONTENT TABS */}
                <div className="flex justify-center gap-4 p-1.5 bg-zinc-100 dark:bg-white/5 rounded-2xl mb-12 max-w-sm mx-auto">
                    <TabItem icon={<Grid size={18} />} label="Posts" active={activeTab === "Posts"} onClick={() => setActiveTab("Posts")} />
                    <TabItem icon={<Clapperboard size={18} />} label="Reels" active={activeTab === "Reels"} onClick={() => setActiveTab("Reels")} />
                </div>

                {/* EMPTY STATE GRID */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-24 px-10 text-center border-2 border-dashed border-zinc-100 dark:border-white/5 rounded-[40px]"
                >
                    <div className="w-20 h-20 bg-zinc-50 dark:bg-white/5 rounded-[30px] flex items-center justify-center mb-6">
                        <Camera size={32} className="text-zinc-300 dark:text-zinc-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No Content Available</h3>
                    <p className="text-zinc-500 text-sm max-w-xs">
                        When {displayUsername} shares photos or reels, they will appear here in your feed.
                    </p>
                </motion.div>
            </main>
        </div>
    )
}

/* --- REUSABLE COMPONENTS --- */

function Stat({ number, label }: { number: number; label: string }) {
    return (
        <div className="flex flex-col items-center md:items-start">
            <span className="text-xl font-black tracking-tighter italic leading-none">{number}</span>
            <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.15em] mt-1">{label}</span>
        </div>
    )
}

function TabItem({ icon, label, active, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`relative flex items-center justify-center gap-3 flex-1 py-3 px-2 rounded-xl transition-all ${active ? "text-blue-500" : "text-zinc-400"
                }`}
        >
            {active && <motion.div layoutId="activeTabPublic" className="absolute inset-0 bg-white dark:bg-white/10 rounded-xl shadow-sm" />}
            <span className="relative z-10">{icon}</span>
            <span className="relative z-10 text-[10px] font-black uppercase tracking-widest hidden md:block">{label}</span>
        </button>
    )
}

function LoadingSkeleton() {
    return (
        <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center gap-8">
            <motion.div
                animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-10 h-10 border-t-2 border-blue-500 rounded-full"
            />
            <div className="text-[10px] font-black text-blue-500 tracking-[0.4em] uppercase animate-pulse">Syncing Profile</div>
        </div>
    )
}

function ErrorState() {
    const router = useRouter()
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#080808] p-6 text-center">
            <div className="w-24 h-24 bg-red-500/10 rounded-[40px] flex items-center justify-center border border-red-500/20">
                <X size={40} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-black italic tracking-tight uppercase">User_Not_Found</h2>
            <p className="text-zinc-500 max-w-xs text-sm">The link might be broken or the user has changed their handle.</p>
            <button
                onClick={() => router.push("/")}
                className="px-8 py-3 bg-white text-black font-bold rounded-2xl active:scale-95 transition-transform uppercase text-xs tracking-widest"
            >
                Return Home
            </button>
        </div>
    )
}

const X = ({ size, className }: any) => (
    <svg width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
        <path d="M18 6L6 18M6 6l12 12" />
    </svg>
)