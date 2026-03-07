"use client"

import React, { useEffect, useState, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
    ChevronLeft, MoreHorizontal, MessageCircle,
    Grid, Clapperboard, Camera, ShieldCheck,
    Globe, X, Users, Search, Heart, Film,
    ChevronLeft as NavLeft, ChevronRight as NavRight,
    Loader2, Image as ImageIcon
} from "lucide-react"
import { cachedApiFetch, setCached } from "@/lib/api"

const API_BASE = "https://zynon.onrender.com/api"

/* ─── TYPES ─── */
interface MediaItem {
    url: string
    type: 'image' | 'video'
    width?: number
    height?: number
    duration?: number
}

interface Post {
    _id: string
    caption: string
    media: MediaItem[]
    likesCount: number
    commentsCount: number
    createdAt: string
    visibility: 'public' | 'followers'
}

/* ─── POST TILE ─── */
function PostTile({ post, index, onClick }: { post: Post; index: number; onClick: () => void }) {
    const primary = post.media[0]
    const hasMultiple = post.media.length > 1
    const isVideo = primary?.type === 'video'

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.025, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={onClick}
            className="relative aspect-square overflow-hidden cursor-pointer group bg-zinc-100 dark:bg-zinc-900 rounded-sm md:rounded-lg"
        >
            {isVideo
                ? <video src={primary.url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" muted playsInline />
                : <img src={primary.url} alt={post.caption} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            }

            {/* Hover overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center gap-5 transition-all"
            >
                <span className="flex items-center gap-1.5 text-white font-bold text-sm">
                    <Heart size={17} fill="white" /> {post.likesCount.toLocaleString()}
                </span>
                <span className="flex items-center gap-1.5 text-white font-bold text-sm">
                    <MessageCircle size={17} fill="white" /> {post.commentsCount.toLocaleString()}
                </span>
            </motion.div>

            {/* Badges */}
            <div className="absolute top-2 right-2 flex gap-1.5 pointer-events-none">
                {hasMultiple && (
                    <div className="w-5 h-5 bg-black/60 backdrop-blur-sm rounded-md flex items-center justify-center">
                        <Grid size={10} className="text-white" />
                    </div>
                )}
                {isVideo && (
                    <div className="w-5 h-5 bg-black/60 backdrop-blur-sm rounded-md flex items-center justify-center">
                        <Film size={10} className="text-white" />
                    </div>
                )}
            </div>
        </motion.div>
    )
}

/* ─── POST DETAIL MODAL ─── */
function PostModal({ post, onClose }: { post: Post; onClose: () => void }) {
    const [mediaIdx, setMediaIdx] = useState(0)
    const current = post.media[mediaIdx]
    const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    })

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/85 backdrop-blur-xl z-[200]"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                transition={{ type: "spring", damping: 30, stiffness: 320 }}
                className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[820px] md:max-h-[88vh] bg-white dark:bg-[#1C1C1E] rounded-[28px] z-[201] overflow-hidden flex flex-col md:flex-row border border-zinc-100 dark:border-white/10 shadow-2xl"
            >
                {/* Media */}
                <div className="relative flex-shrink-0 md:w-[460px] bg-black aspect-square md:aspect-auto">
                    {current?.type === 'video'
                        ? <video src={current.url} controls className="w-full h-full object-contain" />
                        : <img src={current?.url} alt="" className="w-full h-full object-contain" />
                    }

                    {post.media.length > 1 && (
                        <>
                            <button
                                onClick={() => setMediaIdx(i => Math.max(0, i - 1))}
                                disabled={mediaIdx === 0}
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white disabled:opacity-0 transition-all"
                            >
                                <NavLeft size={16} />
                            </button>
                            <button
                                onClick={() => setMediaIdx(i => Math.min(post.media.length - 1, i + 1))}
                                disabled={mediaIdx === post.media.length - 1}
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white disabled:opacity-0 transition-all"
                            >
                                <NavRight size={16} />
                            </button>

                            {/* Dots */}
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                {post.media.map((_, i) => (
                                    <button key={i} onClick={() => setMediaIdx(i)}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${i === mediaIdx ? 'w-4 bg-white' : 'w-1.5 bg-white/40'}`}
                                    />
                                ))}
                            </div>

                            <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                                {mediaIdx + 1}/{post.media.length}
                            </div>
                        </>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-white/5 flex-shrink-0">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                            {post.visibility === 'public' ? '🌐 Public' : '👥 Followers'}
                        </span>
                        <button onClick={onClose} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-full transition-colors text-zinc-500">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-5 py-5">
                        {post.caption
                            ? <p className="text-[15px] text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium whitespace-pre-wrap">{post.caption}</p>
                            : <p className="text-sm text-zinc-400 italic">No caption.</p>
                        }
                    </div>

                    <div className="border-t border-zinc-100 dark:border-white/5 px-5 py-4 flex-shrink-0 space-y-3">
                        <div className="flex items-center gap-5">
                            <span className="flex items-center gap-2 font-bold text-sm">
                                <Heart size={17} className="text-red-500" fill="currentColor" />
                                {post.likesCount.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-2 font-bold text-sm">
                                <MessageCircle size={17} className="text-blue-500" />
                                {post.commentsCount.toLocaleString()}
                            </span>
                        </div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">{formattedDate}</p>

                        {post.media.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                                {post.media.map((m, i) => (
                                    <button key={i} onClick={() => setMediaIdx(i)}
                                        className={`flex-shrink-0 w-11 h-11 rounded-xl overflow-hidden transition-all ${i === mediaIdx ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-[#1C1C1E]' : 'opacity-50 hover:opacity-80'}`}
                                    >
                                        {m.type === 'video'
                                            ? <video src={m.url} className="w-full h-full object-cover" />
                                            : <img src={m.url} alt="" className="w-full h-full object-cover" />
                                        }
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </>
    )
}

/* ─── POSTS GRID ─── */
function PostsGrid({ userId, isPrivate, followStatus }: {
    userId: string
    isPrivate: boolean
    followStatus: "not_following" | "requested" | "following"
}) {
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [cursor, setCursor] = useState<string | null>(null)
    const [hasMore, setHasMore] = useState(true)
    const [selectedPost, setSelectedPost] = useState<Post | null>(null)
    const sentinelRef = useRef<HTMLDivElement | null>(null)
    const observerRef = useRef<IntersectionObserver | null>(null)
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null

    const fetchPosts = useCallback(async (cursorId?: string) => {
        if (!userId) return
        cursorId ? setLoadingMore(true) : setLoading(true)

        try {
            const url = new URL(`${API_BASE}/content/user/${userId}/posts`)
            url.searchParams.set('limit', '12')
            if (cursorId) url.searchParams.set('cursor', cursorId)

            const res = await fetch(url.toString(), {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message)

            const newPosts: Post[] = data.data.posts
            const nextCursor: string | null = data.data.nextCusor ?? null

            setPosts(prev => cursorId ? [...prev, ...newPosts] : newPosts)
            setCursor(nextCursor)
            setHasMore(!!nextCursor)
        } catch (err) {
            console.error('Failed to fetch posts', err)
        } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }, [userId, token])

    useEffect(() => {
        if (!isPrivate || followStatus === 'following') {
            fetchPosts()
        } else {
            setLoading(false)
        }
    }, [fetchPosts, isPrivate, followStatus])

    // Infinite scroll
    useEffect(() => {
        if (!sentinelRef.current || !hasMore) return
        observerRef.current?.disconnect()
        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && !loadingMore && cursor) fetchPosts(cursor)
        }, { rootMargin: '200px' })
        observerRef.current.observe(sentinelRef.current)
        return () => observerRef.current?.disconnect()
    }, [cursor, hasMore, loadingMore, fetchPosts])

    // Private & not following
    if (isPrivate && followStatus !== "following") {
        return (
            <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-black/20 rounded-[32px] border border-zinc-100 dark:border-white/10 text-center space-y-3">
                <ShieldCheck size={36} className="text-zinc-400" />
                <h3 className="text-lg font-semibold tracking-tight">Private Profile</h3>
                <p className="text-sm text-zinc-400">Follow to see their posts.</p>
            </div>
        )
    }

    if (loading) return (
        <div className="grid grid-cols-3 gap-0.5 md:gap-1">
            {Array.from({ length: 9 }).map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.07 }}
                    className="aspect-square bg-zinc-100 dark:bg-zinc-800/60 rounded-sm md:rounded-lg"
                />
            ))}
        </div>
    )

    if (!posts.length) return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 gap-5 text-center"
        >
            <div className="w-20 h-20 rounded-[28px] bg-white dark:bg-white/5 border border-zinc-100 dark:border-white/10 flex items-center justify-center shadow-sm">
                <Camera size={28} strokeWidth={1.2} className="text-zinc-400" />
            </div>
            <div>
                <p className="text-base font-semibold text-zinc-600 dark:text-zinc-300 tracking-tight">No content yet.</p>
                <p className="text-sm text-zinc-400 mt-1">Posts will appear here.</p>
            </div>
        </motion.div>
    )

    return (
        <>
            <div className="grid grid-cols-3 gap-0.5 md:gap-1">
                {posts.map((post, i) => (
                    <PostTile key={post._id} post={post} index={i} onClick={() => setSelectedPost(post)} />
                ))}
            </div>

            <div ref={sentinelRef} className="h-4" />

            {loadingMore && (
                <div className="flex justify-center py-6">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}>
                        <Loader2 size={20} className="text-blue-500" />
                    </motion.div>
                </div>
            )}

            <AnimatePresence>
                {selectedPost && (
                    <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />
                )}
            </AnimatePresence>
        </>
    )
}

/* ─── MAIN PAGE ─── */
export default function PublicProfilePage() {
    const router = useRouter()
    const { username } = useParams() as { username: string }

    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("Posts")
    const [followStatus, setFollowStatus] = useState<"not_following" | "requested" | "following">("not_following")
    const [isProcessing, setIsProcessing] = useState(false)
    const [modalConfig, setModalConfig] = useState<{ type: "followers" | "following"; isOpen: boolean } | null>(null)

    useEffect(() => {
        const loadProfile = async () => {
            const token = localStorage.getItem("accessToken")
            const profileCacheKey = `${API_BASE}/profile/${username}`
            const cached = localStorage.getItem(profileCacheKey)

            if (cached) {
                try {
                    const parsed = JSON.parse(cached)
                    const existingData = parsed.data?.data || parsed.data
                    if (existingData) { setProfile(existingData); setLoading(false) }
                } catch { }
            }

            try {
                if (token) {
                    const { data: myData } = await cachedApiFetch(
                        `${API_BASE}/profile/me`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    ) as { data: any }

                    if (myData?.data?.user?.username === username) {
                        router.replace("/profile")
                        return
                    }
                }

                const res = await fetch(profileCacheKey)
                const fresh = await res.json()

                if (res.ok && fresh.data) {
                    setProfile(fresh.data)
                    setCached(profileCacheKey, {}, fresh)
                    if (token && fresh.data.user?._id) {
                        const statusRes = await fetch(
                            `${API_BASE}/follow/${fresh.data.user._id}/status`,
                            { headers: { Authorization: `Bearer ${token}` } }
                        )
                        const statusData = await statusRes.json()
                        if (statusData.success) setFollowStatus(statusData.data.status)
                    }
                }
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        loadProfile()
    }, [username, router])

    const handleFollowToggle = async () => {
        const token = localStorage.getItem("accessToken")
        if (!token) return router.push("/login")
        setIsProcessing(true)
        try {
            if (followStatus === "not_following") {
                const res = await fetch(`${API_BASE}/follow/${profile.user._id}/follow`, {
                    method: "POST", headers: { Authorization: `Bearer ${token}` }
                })
                const data = await res.json()
                if (data.success) setFollowStatus(data.message.toLowerCase().includes("request") ? "requested" : "following")
            } else if (followStatus === "requested") {
                await fetch(`${API_BASE}/follow/${profile.user._id}/cancel-request`, {
                    method: "DELETE", headers: { Authorization: `Bearer ${token}` }
                })
                setFollowStatus("not_following")
            } else {
                await fetch(`${API_BASE}/follow/${profile.user._id}/unfollow`, {
                    method: "DELETE", headers: { Authorization: `Bearer ${token}` }
                })
                setFollowStatus("not_following")
            }
        } catch (err) {
            console.error(err)
        } finally {
            setIsProcessing(false)
        }
    }

    if (loading) return <LoadingSkeleton />
    if (!profile) return <ErrorState />

    const displayUsername = profile.user?.username || username
    const userId = profile.user?._id

    const followButtonLabel = isProcessing
        ? "Syncing..."
        : followStatus === "following" ? "Following"
            : followStatus === "requested" ? "Requested"
                : "Follow"

    const followButtonStyle = followStatus === "following"
        ? "bg-zinc-100 dark:bg-white/10 text-zinc-700 dark:text-zinc-200"
        : followStatus === "requested"
            ? "bg-zinc-100 dark:bg-white/10 text-zinc-500 dark:text-zinc-400"
            : "bg-blue-600 text-white shadow-lg shadow-blue-500/20"

    return (
        <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#000000] text-[#1D1D1F] dark:text-[#F5F5F7] font-sans">

            {/* NAV */}
            <nav className="sticky top-0 z-50 border-b border-zinc-200 dark:border-white/10 bg-[#FBFBFD]/90 dark:bg-[#000000]/90 backdrop-blur-xl">
                <div className="max-w-4xl mx-auto px-5 h-14 flex items-center justify-between">
                    <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-500 font-medium">
                        <ChevronLeft size={18} /> Back
                    </button>
                    <span className="text-sm font-semibold tracking-tight">{displayUsername}</span>
                    <button className="p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-full transition-colors text-blue-600 dark:text-blue-500">
                        <MoreHorizontal size={20} />
                    </button>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto pt-12 pb-24 px-5">

                {/* PROFILE HEADER */}
                <section className="flex flex-col md:flex-row gap-12 items-center md:items-start mb-14">
                    {/* Avatar */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative cursor-pointer group flex-shrink-0"
                    >
                        <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-[42px] p-1 bg-gradient-to-tr from-blue-500/20 to-emerald-500/20 dark:from-white/10 dark:to-white/5 border border-zinc-200 dark:border-white/10 shadow-2xl transition-all duration-500 group-hover:rotate-1">
                            <div className="w-full h-full rounded-[38px] overflow-hidden bg-white dark:bg-zinc-900 shadow-inner border border-white/20">
                                <img
                                    src={profile.profilePicture || `https://ui-avatars.com/api/?name=${displayUsername}&background=random`}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    alt={displayUsername}
                                />
                            </div>
                            <motion.div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-3 rounded-2xl shadow-xl border-4 border-[#FBFBFD] dark:border-[#000000]">
                                <ShieldCheck size={18} fill="currentColor" />
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex-1 space-y-8 text-center md:text-left"
                    >
                        <div className="flex flex-col md:flex-row md:items-center gap-5">
                            <h2 className="text-4xl font-black tracking-tighter italic uppercase text-[#1D1D1F] dark:text-[#F5F5F7]">
                                {displayUsername}
                            </h2>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={handleFollowToggle}
                                    disabled={isProcessing}
                                    className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] active:scale-95 transition-all disabled:opacity-60 ${followButtonStyle}`}
                                >
                                    {followButtonLabel}
                                </button>
                                <button className="p-2.5 bg-zinc-100 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/10 active:scale-95 transition-transform">
                                    <MessageCircle size={20} className="text-blue-500" />
                                </button>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex justify-center md:justify-start items-center">
                            <Stat number={profile.postsCount ?? 0} label="posts" />
                            <div className="w-px h-8 bg-zinc-200 dark:bg-white/10 mx-6 md:mx-8" />
                            <div className="cursor-pointer" onClick={() => setModalConfig({ type: 'followers', isOpen: true })}>
                                <Stat number={profile.followersCount ?? 0} label="followers" />
                            </div>
                            <div className="w-px h-8 bg-zinc-200 dark:bg-white/10 mx-6 md:mx-8" />
                            <div className="cursor-pointer" onClick={() => setModalConfig({ type: 'following', isOpen: true })}>
                                <Stat number={profile.followingCount ?? 0} label="following" />
                            </div>
                        </div>

                        {/* Bio */}
                        <div className="max-w-md mx-auto md:mx-0 bg-white dark:bg-white/[0.03] p-6 rounded-[32px] border border-zinc-100 dark:border-white/5 shadow-sm text-left">
                            <p className="font-black text-[10px] mb-2 text-blue-500 uppercase tracking-[0.25em] italic">
                                {profile.name || displayUsername}
                            </p>
                            <p className="text-[15px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                                {profile.bio || "No profile data available."}
                            </p>
                            {profile.website && (
                                <a href={profile.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 text-[11px] font-black uppercase tracking-widest mt-4 hover:opacity-70 transition-opacity">
                                    <Globe size={14} /> LINK_BIO
                                </a>
                            )}
                        </div>
                    </motion.div>
                </section>

                {/* TABS + CONTENT */}
                <div className="space-y-6">
                    <div className="flex justify-center border-b border-zinc-200 dark:border-white/10 gap-12">
                        <TabButton active={activeTab === "Posts"} onClick={() => setActiveTab("Posts")} icon={<Grid size={16} />} label="Posts" />
                        <TabButton active={activeTab === "Reels"} onClick={() => setActiveTab("Reels")} icon={<Clapperboard size={16} />} label="Reels" />
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === "Posts" && userId && (
                                <PostsGrid
                                    userId={userId}
                                    isPrivate={!!profile.isPrivate}
                                    followStatus={followStatus}
                                />
                            )}
                            {activeTab === "Reels" && (
                                <div className="flex flex-col items-center justify-center py-32 gap-5 text-center">
                                    <div className="w-20 h-20 rounded-[28px] bg-white dark:bg-white/5 border border-zinc-100 dark:border-white/10 flex items-center justify-center shadow-sm">
                                        <Clapperboard size={28} strokeWidth={1.2} className="text-zinc-400" />
                                    </div>
                                    <p className="text-base font-semibold text-zinc-500 tracking-tight">No reels yet.</p>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* FOLLOWERS / FOLLOWING MODAL */}
            <AnimatePresence>
                {modalConfig?.isOpen && userId && (
                    <UsersListModal
                        userId={userId}
                        type={modalConfig.type}
                        onClose={() => setModalConfig(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

/* ─── USERS LIST MODAL ─── */
function UsersListModal({ userId, type, onClose }: { userId: string, type: 'followers' | 'following', onClose: () => void }) {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const router = useRouter()
    const myToken = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const listRes = await fetch(`${API_BASE}/follow/${userId}/${type}`)
                const listData = await listRes.json()
                const rawList: any[] = listData.data ?? []

                // ✅ Backend already returns flat user objects — no mapping needed
                // Just compute isFollowing badges
                let followingIds = new Set<string>()
                if (myToken) {
                    try {
                        const meRes = await fetch(`${API_BASE}/profile/me`, {
                            headers: { Authorization: `Bearer ${myToken}` }
                        })
                        const meData = await meRes.json()
                        const myUserId = meData?.data?.user?._id
                        if (myUserId) {
                            const myFollowingRes = await fetch(`${API_BASE}/follow/${myUserId}/following`)
                            const myFollowingData = await myFollowingRes.json()
                            followingIds = new Set(
                                (myFollowingData.data ?? []).map((u: any) => u._id)
                            )
                        }
                    } catch { }
                }

                // ✅ rawList items ARE the user objects directly
                setUsers(
                    rawList
                        .filter((u: any) => u?._id)
                        .map((u: any) => ({
                            _resolvedUser: u,
                            isFollowing: followingIds.has(u._id)
                        }))
                )
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchUsers()
    }, [userId, type])
    const handleFollowToggle = async (e: React.MouseEvent, targetUser: any) => {
        e.stopPropagation()
        const targetId = targetUser._id
        const current = users.find(item => item._resolvedUser?._id === targetId)
        const isCurrentlyFollowing = current?.isFollowing

        setUsers(prev => prev.map(item =>
            item._resolvedUser?._id === targetId ? { ...item, isFollowing: !item.isFollowing } : item
        ))

        try {
            await fetch(`${API_BASE}/follow/${targetId}/${isCurrentlyFollowing ? 'unfollow' : 'follow'}`, {
                method: isCurrentlyFollowing ? "DELETE" : "POST",
                headers: { Authorization: `Bearer ${myToken}` }
            })
        } catch {
            setUsers(prev => prev.map(item =>
                item._resolvedUser?._id === targetId ? { ...item, isFollowing: !item.isFollowing } : item
            ))
        }
    }

    const filteredUsers = users.filter(item => {
        const u = item._resolvedUser
        return u?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    })

    return (
        <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]" />
            <motion.div
                initial={{ y: "10%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "10%", opacity: 0 }}
                className="fixed bottom-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-md w-full bg-white dark:bg-[#1C1C1E] md:rounded-[28px] z-[201] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] md:max-h-[80vh] rounded-t-3xl"
            >
                <div className="p-6 border-b border-zinc-200 dark:border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold uppercase tracking-tight italic leading-none capitalize">{type}</h3>
                        <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-blue-600 dark:hover:text-blue-500 transition-colors"><X size={20} /></button>
                    </div>
                    <div className="relative flex items-center">
                        <Search className="absolute left-4 text-zinc-400" size={16} />
                        <input
                            type="text" placeholder="Search" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-zinc-100 dark:bg-black/20 rounded-full py-2.5 pl-10 pr-5 text-base outline-none placeholder:text-zinc-500"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 min-h-[300px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-20 text-zinc-400">
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-current border-t-transparent rounded-full" />
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="py-20 text-center text-zinc-400">
                            <Users size={32} className="mx-auto mb-4 opacity-40" />
                            <p className="text-sm font-medium tracking-tight">No results.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredUsers.map((item: any) => {
                                const u = item._resolvedUser
                                if (!u) return null
                                return (
                                    <div key={u._id} onClick={() => { router.push(`/profile/${u.username}`); onClose() }}
                                        className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-black/20 transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-12 h-12 rounded-full overflow-hidden border border-zinc-200 dark:border-white/10 flex-shrink-0">
                                                <img src={u.profilePicture || `https://ui-avatars.com/api/?name=${u.username}&background=111&color=fff`} className="w-full h-full object-cover" alt={u.username} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-base leading-tight">@{u.username}</span>
                                                <span className="text-sm text-zinc-500 font-medium">{u.name || "Entity"}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={e => handleFollowToggle(e, u)}
                                            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all active:scale-[0.98] ${item.isFollowing ? "bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-500" : "bg-blue-600 text-white"}`}
                                        >
                                            {item.isFollowing ? "Remove" : "Follow"}
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </motion.div>
        </>
    )
}

/* ─── SUPPORTING COMPONENTS ─── */
function Stat({ number, label }: any) {
    return (
        <div className="flex flex-col items-center md:items-start gap-0.5 min-w-[70px]">
            <AnimatePresence mode="wait">
                <motion.span key={number} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="text-2xl font-black tracking-tighter italic leading-none text-[#1D1D1F] dark:text-[#F5F5F7]"
                >
                    {Number(number).toLocaleString()}
                </motion.span>
            </AnimatePresence>
            <span className="text-zinc-400 text-[9px] font-black uppercase tracking-[0.3em]">{label}</span>
        </div>
    )
}

function TabButton({ icon, label, active, onClick }: any) {
    return (
        <button onClick={onClick} className={`relative flex items-center justify-center gap-3 flex-1 py-4 px-2 transition-all ${active ? "text-blue-500" : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"}`}>
            <span className="relative z-10">{icon}</span>
            <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.2em] italic hidden md:block">{label}</span>
            {active && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
        </button>
    )
}

function LoadingSkeleton() {
    return (
        <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#000000] flex flex-col items-center justify-center gap-8">
            <motion.div animate={{ rotate: 360, scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-2 border-blue-600 border-t-transparent rounded-full shadow-[0_0_20px_rgba(37,99,235,0.2)]"
            />
            <div className="text-[10px] font-black text-blue-500 tracking-[0.5em] uppercase animate-pulse italic">Synchronizing...</div>
        </div>
    )
}

function ErrorState() {
    return (
        <div className="min-h-screen flex items-center justify-center text-zinc-500 text-base font-medium tracking-tight">
            Identity not found.
        </div>
    )
}