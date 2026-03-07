'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import Cropper from 'react-easy-crop'
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
    Settings, Grid, Clapperboard, Bookmark,
    Camera, X, Check, MoreHorizontal, Trash2, Users,
    Heart, MessageCircle, Film, Image as ImageIcon,
    ChevronLeft, ChevronRight, Loader2
} from "lucide-react"
import { setCached } from "@/lib/api"

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

/* ─── POSTS GRID ─── */
function PostsGrid({ userId }: { userId: string }) {
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [cursor, setCursor] = useState<string | null>(null)
    const [hasMore, setHasMore] = useState(true)
    const [selectedPost, setSelectedPost] = useState<Post | null>(null)
    const observerRef = useRef<IntersectionObserver | null>(null)
    const sentinelRef = useRef<HTMLDivElement | null>(null)
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
        fetchPosts()
    }, [fetchPosts])

    // Infinite scroll sentinel
    useEffect(() => {
        if (!sentinelRef.current || !hasMore) return
        observerRef.current?.disconnect()

        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && !loadingMore && cursor) {
                fetchPosts(cursor)
            }
        }, { rootMargin: '200px' })

        observerRef.current.observe(sentinelRef.current)
        return () => observerRef.current?.disconnect()
    }, [cursor, hasMore, loadingMore, fetchPosts])

    if (loading) return (
        <div className="grid grid-cols-3 gap-0.5 md:gap-1">
            {Array.from({ length: 9 }).map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.08 }}
                    className="aspect-square bg-zinc-100 dark:bg-zinc-800/60 rounded-sm"
                />
            ))}
        </div>
    )

    if (!posts.length) return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 gap-6"
        >
            <div className="w-20 h-20 rounded-[28px] bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center">
                <ImageIcon size={28} className="text-zinc-400" strokeWidth={1.5} />
            </div>
            <div className="text-center space-y-1">
                <p className="font-black italic uppercase tracking-tighter text-zinc-800 dark:text-zinc-100">No_Posts_Yet</p>
                <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Share your first moment</p>
            </div>
        </motion.div>
    )

    return (
        <>
            <div className="grid grid-cols-3 gap-0.5 md:gap-1">
                {posts.map((post, i) => (
                    <PostTile
                        key={post._id}
                        post={post}
                        index={i}
                        onClick={() => setSelectedPost(post)}
                    />
                ))}
            </div>

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="h-4" />

            {loadingMore && (
                <div className="flex justify-center py-6">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                    >
                        <Loader2 size={20} className="text-blue-500" />
                    </motion.div>
                </div>
            )}

            {/* Post detail modal */}
            <AnimatePresence>
                {selectedPost && (
                    <PostModal
                        post={selectedPost}
                        onClose={() => setSelectedPost(null)}
                    />
                )}
            </AnimatePresence>
        </>
    )
}

/* ─── POST TILE ─── */
function PostTile({ post, index, onClick }: { post: Post; index: number; onClick: () => void }) {
    const primary = post.media[0]
    const hasMultiple = post.media.length > 1
    const isVideo = primary.type === 'video'

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={onClick}
            className="relative aspect-square overflow-hidden cursor-pointer group bg-zinc-100 dark:bg-zinc-800"
        >
            {isVideo
                ? <video src={primary.url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" muted playsInline />
                : <img src={primary.url} alt={post.caption} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            }

            {/* Hover overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-black/50 flex items-center justify-center gap-5"
            >
                <span className="flex items-center gap-2 text-white font-black text-sm">
                    <Heart size={18} fill="white" /> {post.likesCount}
                </span>
                <span className="flex items-center gap-2 text-white font-black text-sm">
                    <MessageCircle size={18} fill="white" /> {post.commentsCount}
                </span>
            </motion.div>

            {/* Badges */}
            <div className="absolute top-2 right-2 flex gap-1.5 pointer-events-none">
                {hasMultiple && (
                    <div className="w-6 h-6 bg-black/60 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <Grid size={11} className="text-white" />
                    </div>
                )}
                {isVideo && (
                    <div className="w-6 h-6 bg-black/60 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <Film size={11} className="text-white" />
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
                className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[200]"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 20 }}
                transition={{ type: "spring", damping: 28, stiffness: 300 }}
                className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[860px] md:max-h-[90vh] bg-white dark:bg-[#0c0c0c] rounded-[32px] z-[201] overflow-hidden flex flex-col md:flex-row border border-white/10 shadow-2xl"
            >
                {/* Media side */}
                <div className="relative flex-shrink-0 md:w-[500px] bg-black aspect-square md:aspect-auto md:h-auto">
                    {current.type === 'video'
                        ? <video src={current.url} controls className="w-full h-full object-contain" />
                        : <img src={current.url} alt="" className="w-full h-full object-contain" />
                    }

                    {/* Media nav */}
                    {post.media.length > 1 && (
                        <>
                            <button
                                onClick={() => setMediaIdx(i => Math.max(0, i - 1))}
                                disabled={mediaIdx === 0}
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white disabled:opacity-0 transition-all"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                onClick={() => setMediaIdx(i => Math.min(post.media.length - 1, i + 1))}
                                disabled={mediaIdx === post.media.length - 1}
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white disabled:opacity-0 transition-all"
                            >
                                <ChevronRight size={18} />
                            </button>

                            {/* Dots */}
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                {post.media.map((_, i) => (
                                    <button key={i} onClick={() => setMediaIdx(i)}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${i === mediaIdx ? 'w-4 bg-white' : 'w-1.5 bg-white/40'}`}
                                    />
                                ))}
                            </div>

                            {/* Counter */}
                            <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl">
                                {mediaIdx + 1}/{post.media.length}
                            </div>
                        </>
                    )}
                </div>

                {/* Info side */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-white/5">
                        <div className="flex gap-2 items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                {post.visibility === 'public' ? '🌐 Public' : '👥 Followers'}
                            </span>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-full transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Caption */}
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                        {post.caption ? (
                            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium whitespace-pre-wrap">
                                {post.caption}
                            </p>
                        ) : (
                            <p className="text-sm text-zinc-400 italic">No caption.</p>
                        )}
                    </div>

                    {/* Stats footer */}
                    <div className="border-t border-zinc-100 dark:border-white/5 px-6 py-5 space-y-4">
                        <div className="flex items-center gap-6">
                            <span className="flex items-center gap-2 font-black text-sm">
                                <Heart size={18} className="text-red-500" fill="currentColor" />
                                {post.likesCount.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-2 font-black text-sm">
                                <MessageCircle size={18} className="text-blue-500" />
                                {post.commentsCount.toLocaleString()}
                            </span>
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{formattedDate}</p>

                        {/* Media strip */}
                        {post.media.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                                {post.media.map((m, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setMediaIdx(i)}
                                        className={`flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden transition-all ${i === mediaIdx ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-[#0c0c0c]' : 'opacity-50 hover:opacity-80'}`}
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

/* ─── TABS ─── */
const TABS = [
    { label: "Posts", icon: <Grid size={18} strokeWidth={2} /> },
    { label: "Reels", icon: <Clapperboard size={18} strokeWidth={2} /> },
    { label: "Saved", icon: <Bookmark size={18} strokeWidth={2} /> },
]

/* ─── MAIN PROFILE PAGE ─── */
export default function ProfilePage() {
    const router = useRouter()
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [openMenu, setOpenMenu] = useState(false)
    const [confirmRemove, setConfirmRemove] = useState(false)
    const [activeTab, setActiveTab] = useState("Posts")
    const [imageToCrop, setImageToCrop] = useState<string | null>(null)
    const [modalConfig, setModalConfig] = useState<{ type: 'followers' | 'following', isOpen: boolean } | null>(null)

    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader()
            reader.addEventListener('load', () => setImageToCrop(reader.result as string))
            reader.readAsDataURL(e.target.files[0])
            setOpenMenu(false)
        }
    }

    const uploadPhoto = async (file: File) => {
        const preview = URL.createObjectURL(file)
        setProfile((prev: any) => ({ ...prev, profilePicture: preview }))
        try {
            setUploading(true)
            const formData = new FormData()
            formData.append("profilePicture", file)
            const res = await fetch(`${API_BASE}/profile/photo`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message)
            setProfile((prev: any) => ({
                ...prev,
                profilePicture: data.data.profilePicture + "?v=" + Date.now()
            }))
        } catch (err) {
            console.error("Upload failed", err)
        } finally {
            setUploading(false)
            URL.revokeObjectURL(preview)
        }
    }

    const removePhoto = async () => {
        try {
            setUploading(true)
            const res = await fetch(`${API_BASE}/profile/photo`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            })
            if (!res.ok) throw new Error("Delete failed")
            setProfile((prev: any) => ({ ...prev, profilePicture: null }))
            setOpenMenu(false)
            setConfirmRemove(false)
        } catch (err) {
            console.error(err)
        } finally {
            setUploading(false)
        }
    }

    useEffect(() => {
        const syncProfile = async () => {
            const cacheKey = `${API_BASE}/profile/me`
            const cached = localStorage.getItem(cacheKey)
            if (cached) {
                try {
                    const parsed = JSON.parse(cached)
                    const existingData = parsed?.data?.data || parsed?.data
                    if (existingData) { setProfile(existingData); setLoading(false) }
                } catch (e) { console.error("Cache read error", e) }
            }
            try {
                const res = await fetch(cacheKey, { headers: { Authorization: `Bearer ${token}` } })
                const fresh = await res.json()
                if (res.ok && fresh.data) {
                    setProfile(fresh.data)
                    setCached(cacheKey, { headers: { Authorization: `Bearer ${token}` } }, fresh)
                }
            } catch (err) {
                console.error("Background sync failed", err)
            } finally {
                setLoading(false)
            }
        }
        if (token) syncProfile()
    }, [token])

    if (loading) return <LoadingSkeleton />
    if (!profile) return <ErrorState />

    const username = profile.user?.username || "user"
    const userId = profile.user?._id

    return (
        <div className="min-h-screen bg-white dark:bg-[#080808] text-zinc-900 dark:text-zinc-100 selection:bg-blue-500/30">

            {/* NAV */}
            <nav className="sticky top-0 z-50 border-b border-zinc-100 dark:border-white/[0.06] bg-white/70 dark:bg-[#080808]/70 backdrop-blur-xl">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="font-black italic uppercase tracking-tighter text-lg">
                        {username}
                    </motion.span>
                    <motion.button whileHover={{ rotate: 90 }} whileTap={{ scale: 0.9 }} className="p-2.5 rounded-xl bg-zinc-100 dark:bg-white/5 border border-transparent dark:border-white/10">
                        <Settings size={20} strokeWidth={1.5} />
                    </motion.button>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto pb-24 px-4 md:px-6">
                {/* PROFILE HEADER */}
                <section className="flex flex-col md:flex-row gap-10 items-center md:items-start pt-10 mb-10">
                    {/* Avatar */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className="relative cursor-pointer group flex-shrink-0"
                        onClick={() => { setConfirmRemove(false); setOpenMenu(true) }}
                    >
                        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-[36px] p-1.5 bg-gradient-to-tr from-blue-500/20 to-emerald-500/20 dark:from-white/10 dark:to-white/5 ring-1 ring-zinc-200 dark:ring-white/10 shadow-2xl transition-all duration-500 group-hover:rotate-2">
                            <div className="w-full h-full rounded-[30px] overflow-hidden bg-white dark:bg-zinc-900">
                                <motion.img
                                    src={profile.profilePicture
                                        ? (profile.profilePicture.includes("cloudinary")
                                            ? profile.profilePicture.replace("/upload/", "/upload/w_400,h_400,c_fill,q_auto,f_auto/")
                                            : profile.profilePicture)
                                        : `https://ui-avatars.com/api/?name=${username}&background=random`}
                                    className={`w-full h-full object-cover transition-all duration-700 ${uploading ? "scale-110 blur-md opacity-50" : "scale-100"}`}
                                />
                            </div>
                            <motion.div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2.5 rounded-2xl shadow-xl border-4 border-white dark:border-[#080808]">
                                <Camera size={16} fill="currentColor" />
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Info */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex-1 space-y-6 text-center md:text-left w-full">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <h2 className="text-3xl font-black tracking-tighter italic uppercase">{username}</h2>
                            <div className="flex gap-3 justify-center">
                                <button onClick={() => router.push("/profile/edit")} className="px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 transition-transform">
                                    Edit Profile
                                </button>
                                <button className="p-2.5 bg-zinc-100 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/10 active:scale-95 transition-transform">
                                    <MoreHorizontal size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex justify-center md:justify-start gap-1">
                            <Stat number={profile.postsCount ?? profile.user?.postsCount ?? 0} label="posts" />
                            <div className="w-px h-8 self-center bg-zinc-200 dark:bg-white/10 mx-4 md:mx-6" />
                            <div className="cursor-pointer" onClick={() => setModalConfig({ type: 'followers', isOpen: true })}>
                                <Stat number={profile.followersCount ?? profile.user?.followersCount ?? 0} label="followers" />
                            </div>
                            <div className="w-px h-8 self-center bg-zinc-200 dark:bg-white/10 mx-4 md:mx-6" />
                            <div className="cursor-pointer" onClick={() => setModalConfig({ type: 'following', isOpen: true })}>
                                <Stat number={profile.followingCount ?? profile.user?.followingCount ?? 0} label="following" />
                            </div>
                        </div>

                        {/* Bio */}
                        <div className="max-w-md mx-auto md:mx-0 bg-zinc-50 dark:bg-white/[0.02] p-5 rounded-3xl border border-zinc-100 dark:border-white/5 text-left">
                            <p className="font-black text-xs mb-2 text-blue-500 uppercase tracking-[0.2em] italic">{profile.name || username}</p>
                            <p className="text-[14px] text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap font-medium">{profile.bio || "No bio yet."}</p>
                        </div>
                    </motion.div>
                </section>

                {/* TABS */}
                <div className="border-t border-zinc-100 dark:border-white/[0.06] mb-1">
                    <div className="flex">
                        {TABS.map(tab => (
                            <button
                                key={tab.label}
                                onClick={() => setActiveTab(tab.label)}
                                className={`relative flex-1 flex items-center justify-center gap-2.5 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-colors
                                    ${activeTab === tab.label ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                            >
                                {tab.icon}
                                <span className="hidden md:block">{tab.label}</span>
                                {activeTab === tab.label && (
                                    <motion.div layoutId="tabUnderline" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-zinc-900 dark:bg-white rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* CONTENT */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === "Posts" && userId && (
                            <PostsGrid userId={userId} />
                        )}
                        {activeTab === "Reels" && (
                            <PlaceholderTab icon={<Clapperboard size={28} strokeWidth={1.5} />} label="No_Reels_Yet" />
                        )}
                        {activeTab === "Saved" && (
                            <PlaceholderTab icon={<Bookmark size={28} strokeWidth={1.5} />} label="Nothing_Saved" />
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* PHOTO SHEET */}
            <AnimatePresence>
                {openMenu && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpenMenu(false)} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]" />
                        <motion.div
                            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 left-0 right-0 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-[450px] bg-white dark:bg-zinc-900 rounded-t-[40px] md:rounded-[40px] md:bottom-6 z-[101] px-8 pb-12 pt-6 shadow-2xl border border-white/10"
                        >
                            <div className="w-12 h-1 bg-zinc-200 dark:bg-white/10 rounded-full mx-auto mb-8" />
                            {!confirmRemove ? (
                                <div className="space-y-3">
                                    <h3 className="text-center font-black text-xl mb-6 tracking-tighter italic uppercase">Identity_Settings</h3>
                                    <label className="flex items-center justify-center gap-3 w-full py-5 bg-blue-600 text-white rounded-[24px] text-xs font-black uppercase tracking-widest cursor-pointer active:scale-95 transition-transform shadow-lg shadow-blue-500/20">
                                        <Camera size={18} /> Upload New
                                        <input type="file" className="hidden" accept="image/*" onChange={onFileChange} />
                                    </label>
                                    <button onClick={() => setConfirmRemove(true)} className="w-full py-5 text-red-500 text-xs font-black uppercase tracking-widest rounded-[24px] border border-red-500/20 bg-red-500/5 active:scale-95 transition-transform">Remove Photo</button>
                                    <button onClick={() => setOpenMenu(false)} className="w-full py-5 text-zinc-500 text-xs font-bold uppercase tracking-widest">Abort</button>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6"><Trash2 size={28} /></div>
                                    <h3 className="font-black text-xl mb-2 italic uppercase tracking-tighter">Confirm_Reset?</h3>
                                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-10">This will revert your avatar to default.</p>
                                    <div className="flex gap-4">
                                        <button onClick={removePhoto} className="flex-1 py-5 bg-red-500 text-white font-black rounded-3xl text-xs uppercase tracking-widest active:scale-95 transition-transform">Delete</button>
                                        <button onClick={() => setConfirmRemove(false)} className="flex-1 py-5 bg-zinc-100 dark:bg-white/5 font-black rounded-3xl text-xs uppercase tracking-widest active:scale-95 transition-transform">Cancel</button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* CROPPER */}
            <AnimatePresence>
                {imageToCrop && (
                    <ImageCropper
                        image={imageToCrop}
                        onCancel={() => setImageToCrop(null)}
                        onComplete={(file: File) => { setImageToCrop(null); uploadPhoto(file) }}
                    />
                )}
            </AnimatePresence>

            {/* FOLLOW MODAL */}
            <AnimatePresence>
                {modalConfig?.isOpen && (
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

/* ─── PLACEHOLDER TAB ─── */
function PlaceholderTab({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-24 gap-5">
            <div className="w-20 h-20 rounded-[28px] bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center text-zinc-400">
                {icon}
            </div>
            <p className="font-black italic uppercase tracking-tighter text-zinc-400 text-sm">{label}</p>
        </div>
    )
}

/* ─── CROPPER ─── */
function ImageCropper({ image, onCancel, onComplete }: any) {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)

    const onCropComplete = useCallback((_: any, pixels: any) => setCroppedAreaPixels(pixels), [])

    const createCroppedImage = async () => {
        const canvas = document.createElement('canvas')
        const img = new Image()
        img.src = image
        await new Promise(res => (img.onload = res))
        canvas.width = croppedAreaPixels.width
        canvas.height = croppedAreaPixels.height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height, 0, 0, croppedAreaPixels.width, croppedAreaPixels.height)
        canvas.toBlob(blob => {
            if (blob) onComplete(new File([blob], "avatar.jpg", { type: "image/jpeg" }))
        }, 'image/jpeg', 0.9)
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] bg-black flex flex-col">
            <div className="relative flex-1">
                <Cropper image={image} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} cropShape="round" showGrid={false} />
            </div>
            <div className="bg-[#080808] p-8 pb-12 flex items-center justify-between gap-6 border-t border-white/5">
                <button onClick={onCancel} className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.3em]">Cancel</button>
                <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={e => setZoom(Number(e.target.value))} className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                <button onClick={createCroppedImage} className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-xl active:scale-90 transition-transform">
                    <Check size={28} />
                </button>
            </div>
        </motion.div>
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
                            // ✅ Backend returns flat user objects, so .data items ARE the users
                            followingIds = new Set(
                                (myFollowingData.data ?? []).map((u: any) => u._id)
                            )
                        }
                    } catch { }
                }

                // ✅ rawList items are flat user objects — no .follower/.following nesting
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
    const handleFollowToggle = async (e: React.MouseEvent, targetId: string, isCurrentlyFollowing: boolean) => {
        e.stopPropagation()
        setUsers(prev => prev.map(item =>
            item._resolvedUser?._id === targetId ? { ...item, isFollowing: !item.isFollowing } : item
        ))
        try {
            const res = await fetch(`${API_BASE}/follow/${targetId}/${isCurrentlyFollowing ? 'unfollow' : 'follow'}`, {
                method: isCurrentlyFollowing ? "DELETE" : "POST",
                headers: { Authorization: `Bearer ${myToken}` }
            })
            if (!res.ok) throw new Error()
        } catch {
            setUsers(prev => prev.map(item =>
                item._resolvedUser?._id === targetId ? { ...item, isFollowing: isCurrentlyFollowing } : item
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[200]" />
            <motion.div
                initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
                className="fixed bottom-0 left-0 right-0 md:relative md:bottom-auto md:m-auto md:top-1/2 md:-translate-y-1/2 md:max-w-md w-full bg-white dark:bg-[#0c0c0c] rounded-t-[40px] md:rounded-[40px] z-[201] overflow-hidden border border-white/10 shadow-2xl flex flex-col max-h-[85vh]"
            >
                <div className="p-6 border-b border-zinc-100 dark:border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-black italic uppercase tracking-tighter text-lg">{type}</h3>
                        <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-full transition-colors"><X size={20} /></button>
                    </div>
                    <input type="text" placeholder="Search directory..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-zinc-100 dark:bg-white/5 rounded-2xl py-3 px-5 text-xs font-bold uppercase tracking-widest outline-none placeholder:text-zinc-500 focus:ring-1 focus:ring-blue-500/50 transition-all" />
                </div>

                <div className="flex-1 overflow-y-auto p-4 min-h-[300px]">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center gap-4">
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">Accessing_Data...</p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="py-20 text-center">
                            <Users size={32} className="mx-auto mb-4 opacity-10" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Zero_Results</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredUsers.map((item: any) => {
                                const u = item._resolvedUser
                                if (!u) return null
                                return (
                                    <div key={u._id} onClick={() => { router.push(`/profile/${u.username}`); onClose() }} className="flex items-center justify-between p-3 rounded-[24px] hover:bg-zinc-100 dark:hover:bg-white/5 transition-all cursor-pointer group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl overflow-hidden ring-1 ring-zinc-200 dark:ring-white/10 bg-zinc-200 dark:bg-zinc-800">
                                                <img src={u.profilePicture || `https://ui-avatars.com/api/?name=${u.username}&background=random`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-black text-sm tracking-tight italic uppercase group-hover:text-blue-500 transition-colors">@{u.username}</span>
                                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{u.name || "System_User"}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={e => handleFollowToggle(e, u._id, item.isFollowing)}
                                            className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 ${item.isFollowing ? "bg-zinc-100 dark:bg-white/5 text-zinc-500 hover:text-red-500 hover:bg-red-500/10" : "bg-blue-600 text-white shadow-lg shadow-blue-500/20"}`}
                                        >
                                            {item.isFollowing ? "Unfollow" : "Follow"}
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                <div className="p-4 bg-zinc-50 dark:bg-white/[0.02] border-t border-zinc-100 dark:border-white/5">
                    <button onClick={onClose} className="w-full py-4 bg-white dark:bg-white/10 font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl active:scale-95 transition-transform">Terminate_Process</button>
                </div>
            </motion.div>
        </>
    )
}

/* ─── SUPPORTING COMPONENTS ─── */
function Stat({ number, label }: any) {
    return (
        <div className="flex flex-col items-center md:items-start gap-0.5 min-w-[65px]">
            <AnimatePresence mode="wait">
                <motion.span key={number} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-xl font-black tracking-tighter italic leading-none">
                    {number}
                </motion.span>
            </AnimatePresence>
            <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
        </div>
    )
}

function LoadingSkeleton() {
    return (
        <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center gap-8">
            <motion.div animate={{ rotate: 360, scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full shadow-[0_0_20px_rgba(37,99,235,0.3)]" />
            <div className="text-[10px] font-black text-blue-500 tracking-[0.5em] uppercase animate-pulse italic">Synchronizing...</div>
        </div>
    )
}

function ErrorState() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#080808] p-6 text-center">
            <div className="w-24 h-24 bg-red-500/10 rounded-[40px] flex items-center justify-center border border-red-500/20"><X size={40} className="text-red-500" strokeWidth={3} /></div>
            <h2 className="text-2xl font-black italic tracking-tighter uppercase">Access_Denied</h2>
            <button onClick={() => window.location.reload()} className="px-8 py-4 bg-white text-black font-black rounded-2xl active:scale-95 transition-transform uppercase text-xs tracking-[0.3em]">Retry Access</button>
        </div>
    )
}