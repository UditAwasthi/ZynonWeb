'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import Cropper from 'react-easy-crop'
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
    Settings, Grid, Clapperboard, Bookmark,
    Camera, X, Check, MoreHorizontal, Trash2, Users
} from "lucide-react"

import { setCached } from "@/lib/api"

const API_BASE = "https://zynon.onrender.com/api"

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

    // --- PHOTO LOGIC ---

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
        // Optimistic Update
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
            
            // Sync with server URL + cache buster
            setProfile((prev: any) => ({
                ...prev,
                profilePicture: data.data.profilePicture + "?v=" + Date.now()
            }))
        } catch (err) {
            console.error("Upload failed", err)
            // Revert on error if possible or show toast
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

    // --- SWR FETCH LOGIC ---
    useEffect(() => {
        const syncProfile = async () => {
            const cacheKey = `${API_BASE}/profile/me`
            const cached = localStorage.getItem(cacheKey)

            if (cached) {
                try {
                    const parsed = JSON.parse(cached)
                    const existingData = parsed?.data?.data || parsed?.data
                    if (existingData) {
                        setProfile(existingData)
                        setLoading(false)
                    }
                } catch (e) { console.error("Cache read error", e) }
            }

            try {
                const res = await fetch(cacheKey, {
                    headers: { Authorization: `Bearer ${token}` }
                })
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
        if (token) syncProfile();
    }, [token]);

    if (loading) return <LoadingSkeleton />
    if (!profile) return <ErrorState />

    const username = profile.user?.username || "user"
    const userId = profile.user?._id

    return (
        <div className="min-h-screen bg-white dark:bg-[#080808] text-zinc-900 dark:text-zinc-100 selection:bg-blue-500/30">
            {/* NAV BAR */}
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

            <main className="max-w-4xl mx-auto pt-10 pb-24 px-6">
                <section className="flex flex-col md:flex-row gap-12 items-center md:items-start mb-16">
                    {/* AVATAR SECTION */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        className="relative cursor-pointer group" 
                        onClick={() => { setConfirmRemove(false); setOpenMenu(true); }}
                    >
                        <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-[40px] p-1.5 bg-gradient-to-tr from-blue-500/20 to-emerald-500/20 dark:from-white/10 dark:to-white/5 ring-1 ring-zinc-200 dark:ring-white/10 shadow-2xl transition-all duration-500 group-hover:rotate-2">
                            <div className="w-full h-full rounded-[34px] overflow-hidden bg-white dark:bg-zinc-900 shadow-inner">
                                <motion.img
                                    src={profile.profilePicture ? (profile.profilePicture.includes("cloudinary") ? profile.profilePicture.replace("/upload/", "/upload/w_400,h_400,c_fill,q_auto,f_auto/") : profile.profilePicture) : `https://ui-avatars.com/api/?name=${username}&background=random`}
                                    className={`w-full h-full object-cover transition-all duration-700 ${uploading ? "scale-110 blur-md opacity-50" : "scale-100"}`}
                                />
                            </div>
                            <motion.div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-3 rounded-2xl shadow-xl border-4 border-white dark:border-[#080808]">
                                <Camera size={18} fill="currentColor" />
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* TEXT INFO SECTION */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex-1 space-y-8 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                            <h2 className="text-3xl font-black tracking-tighter italic uppercase">{username}</h2>
                            <div className="flex gap-3 justify-center">
                                <button onClick={() => router.push("/profile/edit")} className="px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/10 active:scale-95 transition-transform">
                                    Edit Profile
                                </button>
                                <button className="p-2.5 bg-zinc-100 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/10 active:scale-95 transition-transform">
                                    <MoreHorizontal size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-center md:justify-start gap-1">
                            <Stat number={profile.postsCount ?? profile.user?.postsCount ?? 0} label="posts" />
                            <div className="w-px h-8 self-center bg-zinc-200 dark:bg-white/10 mx-4 md:mx-6" />
                            <div className="cursor-pointer group" onClick={() => setModalConfig({ type: 'followers', isOpen: true })}>
                                <Stat number={profile.followersCount ?? profile.user?.followersCount ?? 0} label="followers" />
                            </div>
                            <div className="w-px h-8 self-center bg-zinc-200 dark:bg-white/10 mx-4 md:mx-6" />
                            <div className="cursor-pointer group" onClick={() => setModalConfig({ type: 'following', isOpen: true })}>
                                <Stat number={profile.followingCount ?? profile.user?.followingCount ?? 0} label="following" />
                            </div>
                        </div>

                        <div className="max-w-md mx-auto md:mx-0 bg-zinc-50 dark:bg-white/[0.02] p-5 rounded-3xl border border-zinc-100 dark:border-white/5 text-left">
                            <p className="font-black text-xs mb-2 text-blue-500 uppercase tracking-[0.2em] italic">{profile.name || username}</p>
                            <p className="text-[14px] text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap font-medium">{profile.bio || "No bio yet."}</p>
                        </div>
                    </motion.div>
                </section>
            </main>

            {/* PHOTO ACTION SHEET */}
            <AnimatePresence>
                {openMenu && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpenMenu(false)} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]" />
                        <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed bottom-0 left-0 right-0 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-[450px] bg-white dark:bg-zinc-900 rounded-t-[40px] md:rounded-[40px] md:bottom-6 z-[101] px-8 pb-12 pt-6 shadow-2xl border border-white/10">
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

            {/* CROPPER OVERLAY */}
            <AnimatePresence>
                {imageToCrop && (
                    <ImageCropper
                        image={imageToCrop}
                        onCancel={() => setImageToCrop(null)}
                        onComplete={(croppedFile: File) => {
                            setImageToCrop(null)
                            uploadPhoto(croppedFile)
                        }}
                    />
                )}
            </AnimatePresence>

            {/* FOLLOWERS MODAL */}
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

// --- CROPPING COMPONENT ---

function ImageCropper({ image, onCancel, onComplete }: any) {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)

    const onCropComplete = useCallback((_: any, pixels: any) => {
        setCroppedAreaPixels(pixels)
    }, [])

    const createCroppedImage = async () => {
        const canvas = document.createElement('canvas')
        const img = new Image()
        img.src = image
        await new Promise((res) => (img.onload = res))

        canvas.width = croppedAreaPixels.width
        canvas.height = croppedAreaPixels.height
        const ctx = canvas.getContext('2d')

        ctx?.drawImage(
            img,
            croppedAreaPixels.x, croppedAreaPixels.y,
            croppedAreaPixels.width, croppedAreaPixels.height,
            0, 0,
            croppedAreaPixels.width, croppedAreaPixels.height
        )

        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], "avatar.jpg", { type: "image/jpeg" })
                onComplete(file)
            }
        }, 'image/jpeg', 0.9)
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] bg-black flex flex-col">
            <div className="relative flex-1">
                <Cropper
                    image={image}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                    cropShape="round"
                    showGrid={false}
                />
            </div>
            <div className="bg-[#080808] p-8 pb-12 flex items-center justify-between gap-6 border-t border-white/5">
                <button onClick={onCancel} className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.3em]">Cancel</button>
                <input
                    type="range" value={zoom} min={1} max={3} step={0.1}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <button onClick={createCroppedImage} className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-xl active:scale-90 transition-transform">
                    <Check size={28} />
                </button>
            </div>
        </motion.div>
    )
}


function UsersListModal({ userId, type, onClose }: { userId: string, type: 'followers' | 'following', onClose: () => void }) {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const router = useRouter()
    const myToken = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem("accessToken")

                const [listRes, followingRes] = await Promise.all([
                    fetch(`${API_BASE}/follow/${userId}/${type}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    fetch(`${API_BASE}/follow/${userId}/following`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ])

                const listData = await listRes.json()
                const followingData = await followingRes.json()

                const followingIds = new Set(
                    followingData.data.map((f: any) => f.following._id)
                )

                const initializedUsers = listData.data.map((item: any) => {
                    const u = type === "followers" ? item.follower : item.following
                    return {
                        ...item,
                        isFollowing: followingIds.has(u._id)
                    }
                })

                setUsers(initializedUsers)

            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchUsers()
    }, [userId, type])

    const handleFollowToggle = async (e: React.MouseEvent, targetUser: any) => {
        e.stopPropagation();

        const targetId = targetUser._id;

        const current = users.find(item => {
            const u = type === "followers" ? item.follower : item.following;
            return u._id === targetId;
        });

        const isCurrentlyFollowing = current?.isFollowing;

        // optimistic update
        setUsers(prev =>
            prev.map(item => {
                const u = type === "followers" ? item.follower : item.following;
                if (u._id === targetId) {
                    return { ...item, isFollowing: !item.isFollowing };
                }
                return item;
            })
        );

        try {
            const endpoint = isCurrentlyFollowing
                ? `${API_BASE}/follow/${targetId}/unfollow`
                : `${API_BASE}/follow/${targetId}/follow`;

            const method = isCurrentlyFollowing ? "DELETE" : "POST";

            const res = await fetch(endpoint, {
                method,
                headers: {
                    Authorization: `Bearer ${myToken}`
                }
            });

            if (!res.ok) throw new Error("Request failed");

        } catch (err) {
            console.error("Follow toggle failed", err);

            // revert UI
            setUsers(prev =>
                prev.map(item => {
                    const u = type === "followers" ? item.follower : item.following;
                    if (u._id === targetId) {
                        return { ...item, isFollowing: !item.isFollowing };
                    }
                    return item;
                })
            );
        }
    };
    // Filter users based on search query
    const filteredUsers = users.filter(item => {
        const u = type === 'followers' ? item.follower : item.following;
        return (
            u?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u?.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[200]"
            />
            <motion.div
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                className="fixed bottom-0 left-0 right-0 md:relative md:bottom-auto md:left-auto md:right-auto md:m-auto md:top-1/2 md:-translate-y-1/2 md:max-w-md w-full bg-white dark:bg-[#0c0c0c] rounded-t-[40px] md:rounded-[40px] z-[201] overflow-hidden border border-white/10 shadow-2xl flex flex-col max-h-[85vh]"
            >
                {/* HEADER & SEARCH */}
                <div className="p-6 border-b border-zinc-100 dark:border-white/5 space-y-4 bg-white dark:bg-[#0c0c0c] z-10">
                    <div className="flex items-center justify-between">
                        <h3 className="font-black italic uppercase tracking-tighter text-lg">{type}</h3>
                        <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search directory..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-zinc-100 dark:bg-white/5 border border-transparent focus:border-blue-500/50 rounded-2xl py-3 px-5 text-xs font-bold uppercase tracking-widest outline-none transition-all placeholder:text-zinc-500"
                        />
                    </div>
                </div>

                {/* LIST CONTENT */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar min-h-[300px]">
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
                                const u = type === 'followers' ? item.follower : item.following;
                                if (!u) return null;

                                return (
                                    <div
                                        key={u._id}
                                        onClick={() => { router.push(`/profile/${u.username}`); onClose(); }}
                                        className="flex items-center justify-between p-3 rounded-[24px] hover:bg-zinc-100 dark:hover:bg-white/5 transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl overflow-hidden ring-1 ring-zinc-200 dark:ring-white/10 bg-zinc-200 dark:bg-zinc-800">
                                                <img
                                                    src={u.profilePicture || `https://ui-avatars.com/api/?name=${u.username}&background=random`}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-black text-sm tracking-tight italic uppercase group-hover:text-blue-500 transition-colors">@{u.username}</span>
                                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{u.name || "System_User"}</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={(e) => handleFollowToggle(e, u)}
                                            className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 ${item.isFollowing
                                                ? "bg-zinc-100 dark:bg-white/5 text-zinc-500 hover:text-red-500 hover:bg-red-500/10"
                                                : "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                                                }`}
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
                    <button onClick={onClose} className="w-full py-4 bg-white dark:bg-white/10 text-black dark:text-white font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl active:scale-95 transition-transform">Terminate_Process</button>
                </div>
            </motion.div>
        </>
    )
}

// ... Stat, TabItem, LoadingSkeleton, ErrorState remain same ...
function Stat({ number, label }: any) {
    return (
        <div className="flex flex-col items-center md:items-start gap-0.5 min-w-[65px]">
            <AnimatePresence mode="wait">
                <motion.span
                    key={number}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-xl font-black tracking-tighter italic leading-none"
                >
                    {number}
                </motion.span>
            </AnimatePresence>
            <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
        </div>
    )
}

function TabItem({ icon, label, active, onClick }: any) {
    return (
        <button onClick={onClick} className={`relative flex items-center justify-center gap-3 flex-1 py-3 px-2 rounded-xl transition-all ${active ? "text-blue-500" : "text-zinc-400 hover:text-zinc-200"}`}>
            {active && <motion.div layoutId="activeTab" className="absolute inset-0 bg-white dark:bg-white/10 rounded-xl shadow-sm" />}
            <span className="relative z-10">{icon}</span>
            <span className="relative z-10 text-[10px] font-black uppercase hidden md:block tracking-[0.15em]">{label}</span>
        </button>
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
            <div className="w-24 h-24 bg-red-500/10 rounded-[40px] flex items-center justify-center border border-red-500/20 shadow-2xl shadow-red-500/10"><X size={40} className="text-red-500" strokeWidth={3} /></div>
            <h2 className="text-2xl font-black italic tracking-tighter uppercase">Access_Denied</h2>
            <button onClick={() => window.location.reload()} className="px-8 py-4 bg-white text-black font-black rounded-2xl active:scale-95 transition-transform uppercase text-xs tracking-[0.3em]">Retry Access</button>
        </div>
    )
}