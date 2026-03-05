"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
    ChevronLeft, Camera, Globe, MapPin,
    User, ShieldCheck, Sparkles, Check,
    Info, Lock, Eye
} from "lucide-react"

const API_BASE = "https://zynon.onrender.com/api"

export default function EditProfilePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [hasChanged, setHasChanged] = useState(false)
    const [error, setError] = useState("")

    const [form, setForm] = useState({
        name: "", bio: "", location: "", website: "",
        pronouns: "", gender: "prefer_not_to_say",
        category: "personal", isPrivate: false
    })

    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`${API_BASE}/profile/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                const data = await res.json()
                if (res.ok) setForm(data.data)
            } catch (err) { setError("Failed to sync profile") }
            finally { setLoading(false) }
        }
        fetchProfile()
    }, [token])

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target
        setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
        setHasChanged(true)
    }

    const handleSubmit = async () => {
        setSaving(true)
        try {
            const res = await fetch(`${API_BASE}/profile/me`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(form)
            })
            if (res.ok) router.push("/profile")
        } catch (err) { setError("Save failed") }
        finally { setSaving(false) }
    }

    if (loading) return <LoadingScreen />

    return (
        <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-blue-500/30">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl">
                <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group">
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Cancel</span>
                    </button>
                    <h1 className="text-sm font-bold tracking-widest uppercase opacity-50">Settings</h1>
                    <div className="w-10" /> {/* Spacer */}
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-6 py-12 pb-32">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Hero Section */}
                    <div className="mb-12">
                        <h2 className="text-3xl font-semibold tracking-tight mb-2">Public Profile</h2>
                        <p className="text-zinc-500 text-sm">Manage how people see you across the platform.</p>
                    </div>

                    <form className="space-y-10">
                        {/* Section 1: Identity */}
                        <section className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FloatingInput label="Display Name" name="name" value={form.name} onChange={handleChange} icon={<User size={16} />} />
                                <FloatingInput label="Pronouns" name="pronouns" value={form.pronouns} onChange={handleChange} icon={<Sparkles size={16} />} placeholder="they/them" />
                            </div>

                            <div className="relative group">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1 mb-2 block">About Me</label>
                                <textarea
                                    name="bio"
                                    value={form.bio}
                                    onChange={handleChange}
                                    maxLength={160}
                                    rows={4}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all resize-none text-sm leading-relaxed"
                                    placeholder="Write a short bio..."
                                />
                                <div className="absolute bottom-3 right-4 text-[10px] text-zinc-600 font-mono">
                                    {form.bio?.length}/160
                                </div>
                            </div>
                        </section>

                        {/* Section 2: Details */}
                        <hr className="border-white/5" />
                        <section className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FloatingInput label="Website" name="website" value={form.website} onChange={handleChange} icon={<Globe size={16} />} />
                                <FloatingInput label="Location" name="location" value={form.location} onChange={handleChange} icon={<MapPin size={16} />} />
                            </div>
                        </section>

                        {/* Section 3: Privacy & Category */}
                        <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-8">
                            <div className="flex items-center justify-between group">
                                <div className="flex gap-4 items-center">
                                    <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400">
                                        <Lock size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-sm">Private Account</h4>
                                        <p className="text-xs text-zinc-500">Only your followers can see your content.</p>
                                    </div>
                                </div>
                                <Toggle checked={form.isPrivate} onChange={(val: boolean) => {
                                    setForm({ ...form, isPrivate: val });
                                    setHasChanged(true);
                                }} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <CustomSelect
                                    label="Gender"
                                    name="gender"
                                    value={form.gender}
                                    onChange={handleChange}
                                    options={[
                                        { label: "Male", value: "male" },
                                        { label: "Female", value: "female" },
                                        { label: "Non-binary", value: "non-binary" },
                                        { label: "Other", value: "other" },
                                        { label: "Undisclosed", value: "prefer_not_to_say" }
                                    ]}
                                />
                                <CustomSelect
                                    label="Category"
                                    name="category"
                                    value={form.category}
                                    onChange={handleChange}
                                    options={[
                                        { label: "Personal", value: "personal" },
                                        { label: "Creator", value: "creator" },
                                        { label: "Business", value: "business" }
                                    ]}
                                />
                            </div>
                        </section>
                    </form>
                </motion.div>
            </main>

            {/* Floating Action Bar */}
            <AnimatePresence>
                {hasChanged && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-3rem)] max-w-md"
                    >
                        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-2 shadow-2xl flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 pl-4">
                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                <span className="text-xs font-medium text-zinc-300">Unsaved changes</span>
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={saving}
                                className="bg-white text-black text-sm font-bold py-2.5 px-6 rounded-xl hover:bg-zinc-200 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                            >
                                {saving ? "Saving..." : <><Check size={16} /> Save Changes</>}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

/* --- Styled Components --- */

function FloatingInput({ label, icon, ...props }: any) {
    return (
        <div className="relative group flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">{label}</label>
            <div className="relative flex items-center">
                <div className="absolute left-4 text-zinc-500 group-focus-within:text-blue-400 transition-colors">
                    {icon}
                </div>
                <input
                    {...props}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all text-sm"
                />
            </div>
        </div>
    )
}

function CustomSelect({ label, options, name, value, onChange }: any) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">{label}</label>
            <select
                name={name}
                value={value}
                onChange={onChange}
                className="w-full bg-white/[0.05] border border-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 ring-blue-500/50 appearance-none cursor-pointer hover:bg-white/[0.08]"
            >
                {options.map((opt: any) => <option key={opt.value} value={opt.value} className="bg-zinc-950">{opt.label}</option>)}
            </select>
        </div>
    )
}

function Toggle({ checked, onChange }: any) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`w-12 h-6 rounded-full transition-all relative ${checked ? 'bg-blue-500' : 'bg-white/10'}`}
        >
            <motion.div
                animate={{ x: checked ? 26 : 4 }}
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
            />
        </button>
    )
}

function LoadingScreen() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="relative flex items-center justify-center">
                <div className="w-24 h-24 border border-white/5 rounded-full animate-ping" />
                <div className="absolute w-12 h-12 border-t-2 border-blue-500 rounded-full animate-spin" />
            </div>
        </div>
    )
}