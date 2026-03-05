'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
    Settings, Grid, Clapperboard, Bookmark,
    Camera, Link as LinkIcon, X, Check,
    MoreHorizontal, Trash2
} from "lucide-react"

const API_BASE = "https://zynon.onrender.com/api"

export default function ProfilePage() {
    const router = useRouter()
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [openMenu, setOpenMenu] = useState(false)
    const [confirmRemove, setConfirmRemove] = useState(false)
    const [activeTab, setActiveTab] = useState("Posts")

    // NEW STATE FOR CROPPER
    const [imageToCrop, setImageToCrop] = useState<string | null>(null)

    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader()
            reader.addEventListener('load', () => setImageToCrop(reader.result as string))
            reader.readAsDataURL(e.target.files[0])
            setOpenMenu(false)
        }
    }

    function optimizeAvatar(url: string) {
        if (!url || !url.includes("cloudinary")) return url
        return url.replace("/upload/", "/upload/w_300,h_300,c_fill,q_auto,f_auto/")
    }

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`${API_BASE}/profile/me`, {
                    headers: { Authorization: `Bearer ${token}` }
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
            console.error(err)
        } finally {
            setUploading(false)
        }
    }

    const removePhoto = async () => {
        try {
            setUploading(true)
            const res = await fetch(`${API_BASE}/profile/photo`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message)
            setProfile((prev: any) => ({ ...prev, profilePicture: null }))
            setOpenMenu(false)
            setConfirmRemove(false)
        } catch (err) {
            console.error(err)
        } finally {
            setUploading(false)
        }
    }

    if (loading) return <LoadingSkeleton />
    if (!profile) return <ErrorState />

    const username = profile.user?.username || "user"

    return (
        <div className="min-h-screen bg-white dark:bg-[#080808] text-zinc-900 dark:text-zinc-100 selection:bg-blue-500/30">
            {/* NAVBAR */}
            <nav className="sticky top-0 z-50 border-b border-zinc-100 dark:border-white/[0.06] bg-white/70 dark:bg-[#080808]/70 backdrop-blur-xl">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="font-bold text-lg tracking-tight bg-gradient-to-br from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500 bg-clip-text text-transparent">
                        {username}
                    </motion.span>
                    <motion.button whileHover={{ rotate: 90 }} whileTap={{ scale: 0.9 }} className="p-2.5 rounded-xl bg-zinc-100 dark:bg-white/5 border border-transparent dark:border-white/10">
                        <Settings size={20} strokeWidth={1.5} />
                    </motion.button>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto pt-10 pb-24 px-6">
                <section className="flex flex-col md:flex-row gap-12 items-center md:items-start mb-16">
                    {/* AVATAR */}
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative cursor-pointer" onClick={() => { setConfirmRemove(false); setOpenMenu(true); }}>
                        <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-[40px] p-1.5 bg-gradient-to-tr from-blue-500/20 to-emerald-500/20 dark:from-white/10 dark:to-white/5 ring-1 ring-zinc-200 dark:ring-white/10 shadow-2xl">
                            <div className="w-full h-full rounded-[34px] overflow-hidden bg-white dark:bg-zinc-900 shadow-inner">
                                <motion.img
                                    src={optimizeAvatar(profile.profilePicture) || `https://ui-avatars.com/api/?name=${username}&background=random`}
                                    className={`w-full h-full object-cover ${uploading ? "scale-110 blur-sm opacity-50" : "scale-100"}`}
                                />
                            </div>
                            <motion.div whileHover={{ scale: 1.1 }} className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-3 rounded-2xl shadow-xl border-4 border-white dark:border-[#080808]">
                                <Camera size={18} fill="currentColor" />
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* PROFILE INFO */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex-1 space-y-8 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                            <h2 className="text-3xl font-bold tracking-tight">{username}</h2>
                            <div className="flex gap-3 justify-center">
                                <button onClick={() => router.push("/profile/edit")} className="px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold shadow-lg shadow-blue-500/10 active:scale-95 transition-transform">
                                    Edit Profile
                                </button>
                                <button className="p-2.5 bg-zinc-100 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/10 active:scale-95 transition-transform">
                                    <MoreHorizontal size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-center md:justify-start gap-1">
                            <Stat number={profile.postsCount || 0} label="posts" />
                            <div className="w-px h-8 self-center bg-zinc-200 dark:bg-white/10 mx-4 md:mx-6" />
                            <Stat number={profile.followersCount || 0} label="followers" />
                            <div className="w-px h-8 self-center bg-zinc-200 dark:bg-white/10 mx-4 md:mx-6" />
                            <Stat number={profile.followingCount || 0} label="following" />
                        </div>

                        <div className="max-w-md mx-auto md:mx-0 bg-zinc-50 dark:bg-white/[0.02] p-5 rounded-3xl border border-zinc-100 dark:border-white/5 text-left">
                            <p className="font-bold text-sm mb-2 text-blue-500 uppercase tracking-widest">{profile.name || username}</p>
                            <p className="text-[15px] text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">{profile.bio || "Crafting digital experiences."}</p>
                        </div>
                    </motion.div>
                </section>

                {/* TABS & CONTENT */}
                <div className="mt-8">
                    <div className="flex justify-center gap-1 md:gap-4 p-1.5 bg-zinc-100 dark:bg-white/5 rounded-2xl mb-8 max-w-sm mx-auto">
                        <TabItem icon={<Grid size={18} />} label="Posts" active={activeTab === "Posts"} onClick={() => setActiveTab("Posts")} />
                        <TabItem icon={<Clapperboard size={18} />} label="Reels" active={activeTab === "Reels"} onClick={() => setActiveTab("Reels")} />
                        <TabItem icon={<Bookmark size={18} />} label="Saved" active={activeTab === "Saved"} onClick={() => setActiveTab("Saved")} />
                    </div>
                    <motion.div layout className="grid grid-cols-3 gap-2 md:gap-6">
                        {[...Array(6)].map((_, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="aspect-square bg-zinc-100 dark:bg-white/[0.03] rounded-3xl border border-zinc-200 dark:border-white/10 hover:border-blue-500/50 transition-colors cursor-pointer group relative overflow-hidden" />
                        ))}
                    </motion.div>
                </div>
            </main>

            {/* ACTION SHEET */}
            <AnimatePresence>
                {openMenu && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpenMenu(false)} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]" />
                        <motion.div initial={{ y: "100%", scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: "100%", scale: 0.95 }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed bottom-4 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-[450px] bg-white dark:bg-zinc-900 rounded-[40px] z-[101] px-8 pb-10 pt-6 shadow-2xl overflow-hidden border border-white/10">
                            <div className="w-16 h-1.5 bg-zinc-200 dark:bg-white/10 rounded-full mx-auto mb-10" />
                            {!confirmRemove ? (
                                <div className="space-y-3">
                                    <h3 className="text-center font-black text-2xl mb-8 tracking-tight italic uppercase">Photo Settings</h3>
                                    <label className="flex items-center justify-center gap-3 w-full py-5 bg-blue-600 text-white rounded-[24px] font-bold cursor-pointer active:scale-95 transition-transform shadow-lg shadow-blue-500/20">
                                        <Camera size={20} /> Upload New Photo
                                        <input type="file" className="hidden" accept="image/*" onChange={onFileChange} />
                                    </label>
                                    <button onClick={() => setConfirmRemove(true)} className="w-full py-5 text-red-500 font-bold rounded-[24px] border border-red-500/20 bg-red-500/5 active:scale-95 transition-transform">Remove Current</button>
                                    <button onClick={() => setOpenMenu(false)} className="w-full py-5 text-zinc-400 font-medium rounded-[24px]">Close</button>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-[30px] flex items-center justify-center mx-auto mb-6"><Trash2 size={32} /></div>
                                    <h3 className="font-bold text-2xl mb-3 italic">ARE YOU SURE?</h3>
                                    <p className="text-zinc-500 text-sm mb-10 px-6">This will permanently reset your avatar.</p>
                                    <div className="flex gap-4">
                                        <button onClick={removePhoto} className="flex-1 py-5 bg-red-500 text-white font-black rounded-3xl shadow-xl shadow-red-500/20 active:scale-95 transition-transform uppercase tracking-tighter">Confirm</button>
                                        <button onClick={() => setConfirmRemove(false)} className="flex-1 py-5 bg-zinc-100 dark:bg-white/5 font-bold rounded-3xl active:scale-95 transition-transform uppercase tracking-tighter">Abort</button>
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
        </div>
    )
}

// --- HELPER COMPONENTS ---

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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black flex flex-col">
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
            <div className="bg-[#080808] p-8 pb-12 flex items-center justify-between gap-6">
                <button onClick={onCancel} className="text-zinc-400 font-bold text-xs uppercase tracking-widest">Cancel</button>
                <input
                    type="range" value={zoom} min={1} max={3} step={0.1}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <button onClick={createCroppedImage} className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center shadow-xl active:scale-90 transition-transform">
                    <Check size={24} />
                </button>
            </div>
        </motion.div>
    )
}

function Stat({ number, label }: any) {
    return (
        <div className="flex flex-col items-center md:items-start gap-0.5">
            <span className="text-xl font-black tracking-tighter italic">{number}</span>
            <span className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest">{label}</span>
        </div>
    )
}

function TabItem({ icon, label, active, onClick }: any) {
    return (
        <button onClick={onClick} className={`relative flex items-center justify-center gap-3 flex-1 py-3 px-2 rounded-xl transition-all ${active ? "text-blue-500" : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"}`}>
            {active && <motion.div layoutId="activeTab" className="absolute inset-0 bg-white dark:bg-white/10 rounded-xl shadow-sm" />}
            <span className="relative z-10">{icon}</span>
            <span className="relative z-10 text-xs font-bold uppercase hidden md:block tracking-widest">{label}</span>
        </button>
    )
}

function LoadingSkeleton() {
    return (
        <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center gap-8">
            <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-12 h-12 border-t-2 border-r-2 border-blue-500 rounded-full" />
            <div className="text-[10px] font-black text-blue-500 tracking-[0.4em] uppercase animate-pulse">Establishing Connection</div>
        </div>
    )
}

function ErrorState() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#080808] p-6 text-center">
            <div className="w-24 h-24 bg-red-500/10 rounded-[40px] flex items-center justify-center border border-red-500/20"><X size={40} className="text-red-500" strokeWidth={3} /></div>
            <h2 className="text-2xl font-black italic tracking-tight">PROFILE_NOT_FOUND</h2>
            <button onClick={() => window.location.reload()} className="px-8 py-3 bg-white text-black font-bold rounded-2xl active:scale-95 transition-transform uppercase text-sm tracking-widest">Retry Access</button>
        </div>
    )
}