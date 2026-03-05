'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

const API_BASE = "https://zynon.onrender.com/api"

interface FollowRequest {
    _id: string; // the follow document ID
    follower: {
        _id: string; // the actual User ID
        username: string;
        profilePicture?: string;
    }
}

export default function NotificationsPage() {
    const router = useRouter()
    const [pendingRequests, setPendingRequests] = useState<FollowRequest[]>([])
    const [loading, setLoading] = useState(true)

    // 1. FETCH PENDING REQUESTS
    useEffect(() => {
        const fetchRequests = async () => {
            const token = localStorage.getItem("accessToken")
            if (!token) return

            try {
                const res = await fetch(`${API_BASE}/follow/requests`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                const data = await res.json()
                if (data.success) {
                    setPendingRequests(data.data)
                }
            } catch (err) {
                console.error("Failed to fetch follow requests:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchRequests()
    }, [])

    // 2. ACCEPT REQUEST
    const handleAccept = async (userId: string, followId: string) => {
        const token = localStorage.getItem("accessToken")
        // Optimistic UI update: Remove from list immediately
        setPendingRequests(prev => prev.filter(req => req._id !== followId))

        try {
            const res = await fetch(`${API_BASE}/follow/${userId}/accept`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            })
            if (!res.ok) throw new Error("Failed to accept")
        } catch (err) {
            console.error("Accept error:", err)
            // Optional: Restore item if API fails
        }
    }

    // 3. REJECT REQUEST
    const handleReject = async (userId: string, followId: string) => {
        const token = localStorage.getItem("accessToken")
        setPendingRequests(prev => prev.filter(req => req._id !== followId))

        try {
            const res = await fetch(`${API_BASE}/follow/${userId}/reject`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            })
            if (!res.ok) throw new Error("Failed to reject")
        } catch (err) {
            console.error("Reject error:", err)
        }
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#080808] text-zinc-900 dark:text-zinc-100 flex justify-center py-8 px-4">
            <div className="max-w-[600px] w-full flex flex-col gap-8">
                
                <div className="px-2">
                    <h1 className="text-2xl font-black tracking-tighter uppercase italic">Notifications</h1>
                </div>

                {/* FOLLOW REQUESTS SECTION */}
                <AnimatePresence mode="popLayout">
                    {!loading && pendingRequests.length > 0 && (
                        <motion.section 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="mb-4"
                        >
                            <div className="flex items-center justify-between px-2 mb-4">
                                <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                                    Pending Requests
                                </h2>
                                <span className="bg-blue-500 w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
                            </div>

                            <div className="space-y-2">
                                {pendingRequests.map((req) => {
                                    const user = req.follower
                                    const avatar = user?.profilePicture 
                                        ? user.profilePicture 
                                        : `https://ui-avatars.com/api/?name=${user?.username}&background=random`

                                    return (
                                        <motion.div
                                            layout
                                            key={req._id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-white/[0.03] border border-zinc-100 dark:border-white/[0.05] rounded-[24px] hover:border-zinc-200 dark:hover:border-white/10 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                {/* CLICKABLE AVATAR */}
                                                <button 
                                                    onClick={() => router.push(`/profile/${user?.username}`)}
                                                    className="w-12 h-12 rounded-2xl overflow-hidden ring-1 ring-zinc-200 dark:ring-white/10 active:scale-90 transition-transform"
                                                >
                                                    <img src={avatar} className="w-full h-full object-cover" alt={user?.username} />
                                                </button>

                                                {/* CLICKABLE USERNAME */}
                                                <div className="flex flex-col">
                                                    <button 
                                                        onClick={() => router.push(`/profile/${user?.username}`)}
                                                        className="font-bold text-sm tracking-tight text-left hover:text-blue-500 transition-colors"
                                                    >
                                                        @{user?.username}
                                                    </button>
                                                    <span className="text-[11px] text-zinc-500 font-medium text-left">Requested to follow you</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleAccept(user?._id, req._id)}
                                                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black uppercase tracking-tighter rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => handleReject(user?._id, req._id)}
                                                    className="px-5 py-2 bg-zinc-200 dark:bg-white/5 hover:bg-zinc-300 dark:hover:bg-white/10 text-zinc-900 dark:text-zinc-100 text-[11px] font-black uppercase tracking-tighter rounded-xl transition-all active:scale-95"
                                                >
                                                    Ignore
                                                </button>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </motion.section>
                    )}
                </AnimatePresence>

                {/* RECENT ACTIVITY SECTION */}
                <section className="space-y-6">
                    <h2 className="text-[10px] font-black px-2 text-zinc-400 uppercase tracking-[0.2em]">
                        Recent Activity
                    </h2>

                    {loading ? (
                        <div className="flex flex-col items-center py-10 gap-3">
                             <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                             <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Syncing...</span>
                        </div>
                    ) : pendingRequests.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center px-10 border-2 border-dashed border-zinc-100 dark:border-white/5 rounded-[40px]">
                            <p className="text-zinc-500 text-sm font-black uppercase italic tracking-tighter">Signal_Clear</p>
                            <p className="text-zinc-400 text-[10px] mt-1 uppercase tracking-widest opacity-60">No new transmissions</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}