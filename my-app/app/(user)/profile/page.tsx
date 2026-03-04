'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from "next/navigation"

const API_BASE = "https://zynon.onrender.com/api"

export default function ProfilePage() {
    const router = useRouter()
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Token logic maintained
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`${API_BASE}/profile/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                    credentials: "include"
                })
                const data = await res.json()
                if (!res.ok) throw new Error(data.message)
                setProfile(data.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [token])

    if (loading) return <LoadingSkeleton />

    if (!profile) return <ErrorState />

    const username = profile.user?.username || "user"

    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
            <main className="max-w-4xl mx-auto pt-12 pb-24 px-4">

                {/* HEADER SECTION */}
                <section className="flex flex-col md:flex-row gap-10 items-center md:items-start mb-16">
                    {/* Avatar with Ring */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-tr from-yellow-400 to-fuchsia-600 rounded-full opacity-75 blur-sm group-hover:opacity-100 transition duration-1000"></div>
                        <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full p-1.5 bg-white dark:bg-zinc-950">
                            <img
                                src={profile.profilePicture || "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=400&q=80"}
                                className="w-full h-full rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
                                alt="Profile"
                            />
                        </div>
                    </div>

                    {/* Profile Details */}
                    <div className="flex-1 space-y-6">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                            <h1 className="text-2xl font-light tracking-tight">{username}</h1>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => router.push("/profile/edit")}
                                    className="px-6 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg text-sm font-semibold shadow-sm transition-all"
                                >
                                    Edit Profile
                                </button>
                                <button className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors">
                                    <SettingsIcon />
                                </button>
                            </div>
                        </div>

                        {/* Stats Desktop */}
                        <div className="hidden md:flex gap-10">
                            <Stat number={profile.postsCount} label="posts" />
                            <Stat number={profile.followersCount} label="followers" />
                            <Stat number={profile.followingCount} label="following" />
                        </div>

                        {/* Bio Block */}
                        <div className="text-center md:text-left space-y-1">
                            {profile.name && <p className="font-bold text-base">{profile.name}</p>}
                            {profile.bio && <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-md">{profile.bio}</p>}
                            {profile.website && (
                                <a href={profile.website} target="_blank" className="text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center justify-center md:justify-start gap-1">
                                    <LinkIcon />
                                    {profile.website.replace(/(^\w+:|^)\/\//, '')}
                                </a>
                            )}
                        </div>
                    </div>
                </section>

                {/* Mobile Stats Divider */}
                <div className="flex md:hidden justify-around py-4 border-y border-zinc-200 dark:border-zinc-800 mb-8">
                    <Stat number={profile.postsCount} label="posts" />
                    <Stat number={profile.followersCount} label="followers" />
                    <Stat number={profile.followingCount} label="following" />
                </div>

                {/* CONTENT TABS */}
                <div className="border-t border-zinc-200 dark:border-zinc-800">
                    <div className="flex justify-center gap-12 -mt-px">
                        <TabItem icon={<GridIcon />} label="POSTS" active />
                        <TabItem icon={<ReelsSmallIcon />} label="REELS" />
                        <TabItem icon={<BookmarkSmallIcon />} label="SAVED" />
                    </div>

                    {/* POSTS GRID */}
                    <div className="grid grid-cols-3 gap-1 md:gap-6 mt-8">
                        {[...Array(9)].map((_, i) => (
                            <div
                                key={i}
                                className="aspect-square bg-zinc-200/50 dark:bg-zinc-900/50 rounded-sm md:rounded-lg animate-pulse flex items-center justify-center"
                            >
                                <ImageIcon />
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}

/* UI COMPONENTS */

function Stat({ number, label }: { number: number; label: string }) {
    return (
        <div className="flex flex-col md:flex-row md:gap-1.5 items-center">
            <span className="font-bold text-lg md:text-base">{number}</span>
            <span className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base lowercase">{label}</span>
        </div>
    )
}

function TabItem({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
    return (
        <div className={`flex items-center gap-2 py-4 cursor-pointer transition-all border-t-[1.5px] 
            ${active
                ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100'
                : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
            }`}>
            {icon}
            <span className="text-xs font-bold tracking-[1.5px] uppercase">{label}</span>
        </div>
    )
}

function LoadingSkeleton() {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-zinc-800 border-t-zinc-400 rounded-full animate-spin" />
            <p className="text-zinc-400 font-medium animate-pulse">Synchronizing Profile...</p>
        </div>
    )
}

function ErrorState() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
            <div className="text-center p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800">
                <h3 className="text-xl font-bold mb-2">Profile Unavailable</h3>
                <p className="text-zinc-500 mb-6">We couldn't retrieve the account data.</p>
                <button onClick={() => window.location.reload()} className="px-6 py-2 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white rounded-full font-semibold">
                    Retry
                </button>
            </div>
        </div>
    )
}

/* UPDATED ICONS */

const SettingsIcon = () => (
    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
)

const LinkIcon = () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
)

const GridIcon = () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
    </svg>
)

const ReelsSmallIcon = () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5z" />
        <path d="M10 9l5 3-5 3V9z" />
    </svg>
)

const BookmarkSmallIcon = () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
)

const ImageIcon = () => (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1" className="opacity-20" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
    </svg>
)