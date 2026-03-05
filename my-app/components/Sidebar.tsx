'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    Home, Search, Compass, Play, 
    MessageSquare, Heart, PlusSquare, 
    LogOut, Menu, ChevronLeft, Shield 
} from 'lucide-react'

interface NavItem {
    label: string;
    path: string;
    icon: React.ElementType;
    badge?: string;
    onClick?: () => void;
}

export default function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

    const handleLogout = async (allDevices = false) => {
        const endpoint = allDevices ? "/api/auth/logout-all" : "/api/auth/logout";
        try {
            await fetch(`https://zynon.onrender.com${endpoint}`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            })
        } catch (err) {
            console.error("logout failed", err)
        }
        localStorage.removeItem("accessToken")
        router.push("/login")
    }

    const navItems: NavItem[] = [
        { label: 'Home', path: '/home', icon: Home },
        { label: 'Search', path: '/search', icon: Search, onClick: () => setIsCollapsed(false) },
        { label: 'Explore', path: '/explore', icon: Compass },
        { label: 'Reels', path: '/reels', icon: Play },
        { label: 'Messages', path: '/messages', icon: MessageSquare, badge: "9+" },
        { label: 'Notifications', path: '/notifications', icon: Heart },
        { label: 'Create', path: '/create', icon: PlusSquare },
    ]

    return (
        <>
            <motion.aside
                layout
                initial={false}
                animate={{ width: isCollapsed ? 88 : 260 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="sticky top-0 h-screen flex flex-col py-6 z-[100] border-r bg-white dark:bg-[#080808] border-zinc-100 dark:border-white/[0.06]"
            >
                {/* 1. BRANDING */}
                <div className="px-7 mb-12 flex items-center overflow-hidden">
                    <AnimatePresence mode="wait">
                        {!isCollapsed ? (
                            <motion.div
                                key="logo-full"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="flex items-center gap-2"
                            >
                                <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <span className="text-white font-black text-xl italic">Z</span>
                                </div>
                                <h1 className="text-xl font-black tracking-tighter italic dark:text-white">
                                    ZYNON
                                </h1>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="logo-dot" 
                                initial={{ scale: 0.5, opacity: 0 }} 
                                animate={{ scale: 1, opacity: 1 }} 
                                className="w-10 h-10 bg-zinc-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto border border-zinc-200 dark:border-white/10"
                            >
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 2. MAIN NAVIGATION */}
                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.label}
                                href={item.path}
                                onClick={item.onClick}
                                className={`group relative flex items-center rounded-2xl transition-all duration-300
                                    ${isCollapsed ? 'justify-center w-14 h-14 mx-auto' : 'px-4 py-3.5 gap-4 w-full'}
                                    ${isActive ? 'text-blue-500' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'}`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-glow"
                                        className="absolute inset-0 bg-blue-500/[0.04] dark:bg-white/[0.03] border border-blue-500/10 dark:border-white/10 rounded-2xl -z-10 shadow-[0_0_20px_rgba(59,130,246,0.05)]"
                                    />
                                )}

                                <div className="relative">
                                    <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                                    {item.badge && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 w-2 h-2 rounded-full border-2 border-white dark:border-[#080808]" />
                                    )}
                                </div>

                                {!isCollapsed && (
                                    <motion.span 
                                        initial={{ opacity: 0 }} 
                                        animate={{ opacity: 1 }} 
                                        className={`text-sm font-bold tracking-tight ${isActive ? 'italic' : ''}`}
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* 3. FOOTER ACTIONS */}
                <div className="px-4 mt-auto space-y-2">
                    {/* PROFILE LINK */}
                    <Link
                        href="/profile"
                        className={`group flex items-center rounded-2xl transition-all duration-300
                            ${isCollapsed ? 'justify-center w-14 h-14 mx-auto' : 'px-4 py-3 gap-4 w-full'}
                            ${pathname === '/profile' ? 'text-blue-500' : 'text-zinc-500'}`}
                    >
                        <div className={`w-7 h-7 rounded-full overflow-hidden ring-2 transition-all duration-300 ${pathname === '/profile' ? 'ring-blue-500 shadow-lg shadow-blue-500/20' : 'ring-zinc-200 dark:ring-white/10'}`}>
                            <img
                                src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=100&q=80"
                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                alt="Profile"
                            />
                        </div>
                        {!isCollapsed && <span className="text-sm font-bold tracking-tight">Profile</span>}
                    </Link>

                    {/* LOGOUT */}
                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className={`flex items-center rounded-2xl text-zinc-400 hover:text-red-500 hover:bg-red-500/5 transition-all duration-300
                            ${isCollapsed ? 'justify-center w-14 h-14 mx-auto' : 'px-4 py-3.5 gap-4 w-full'}`}
                    >
                        <LogOut size={22} />
                        {!isCollapsed && <span className="text-sm font-bold tracking-tight">Logout</span>}
                    </button>

                    <div className="h-px bg-zinc-100 dark:bg-white/[0.06] my-2" />

                    {/* COLLAPSE TOGGLE */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={`flex items-center gap-4 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all
                            ${isCollapsed ? 'justify-center w-14 h-14 mx-auto' : 'px-4 py-3.5 w-full'}`}
                    >
                        <motion.div animate={{ rotate: isCollapsed ? 180 : 0 }}>
                            {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
                        </motion.div>
                        {!isCollapsed && <span className="text-[11px] font-black uppercase tracking-widest opacity-60">Collapse</span>}
                    </button>
                </div>
            </motion.aside>

            {/* --- LOGOUT MODAL --- */}
            <AnimatePresence>
                {showLogoutConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white dark:bg-[#0c0c0c] p-8 rounded-[40px] max-w-sm w-full shadow-2xl border border-zinc-100 dark:border-white/5 text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50" />
                            
                            <div className="w-16 h-16 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <Shield className="text-red-500" size={28} />
                            </div>

                            <h3 className="text-xl font-black tracking-tight italic dark:text-white uppercase">Secure Sign Out</h3>
                            <p className="text-zinc-500 text-sm mt-2 mb-8 font-medium px-4">Are you sure you want to disconnect from the Zynon network?</p>

                            <div className="space-y-3">
                                <button 
                                    onClick={() => handleLogout(false)} 
                                    className="w-full py-4 bg-zinc-900 dark:bg-white dark:text-black text-white rounded-2xl font-black text-xs uppercase tracking-widest active:scale-[0.97] transition-all hover:shadow-xl dark:hover:shadow-white/5"
                                >
                                    End Session
                                </button>
                                <button 
                                    onClick={() => handleLogout(true)} 
                                    className="w-full py-3 text-red-500 font-bold text-xs uppercase tracking-tighter opacity-70 hover:opacity-100 transition-opacity"
                                >
                                    Sign out all devices
                                </button>
                                <button 
                                    onClick={() => setShowLogoutConfirm(false)} 
                                    className="w-full py-3 text-zinc-400 font-bold text-xs uppercase tracking-widest"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}