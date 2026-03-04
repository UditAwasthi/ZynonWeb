'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

interface NavItem {
    label: string;
    path: string;
    icon: React.ReactNode;
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
        { label: 'Home', path: '/home', icon: <HomeIcon /> },
        { label: 'Search', path: '/search', icon: <SearchIcon />, onClick: () => setIsCollapsed(false) },
        { label: 'Explore', path: '/explore', icon: <ExploreIcon /> },
        { label: 'Reels', path: '/reels', icon: <ReelsIcon /> },
        { label: 'Messages', path: '/messages', icon: <MessagesIcon />, badge: "9+" },
        { label: 'Notifications', path: '/notifications', icon: <HeartIcon /> },
        { label: 'Create', path: '/create', icon: <PlusIcon /> },
        {
            label: 'Profile',
            path: '/profile',
            icon: (
                <div className="w-6 h-6 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800">
                    <img
                        src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=100&q=80"
                        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                        alt="Profile"
                    />
                </div>
            )
        },
        { label: 'Logout', path: '#', icon: <LogoutIcon />, onClick: () => setShowLogoutConfirm(true) },
    ]

    return (
        <>
            <motion.aside
                layout
                initial={false}
                animate={{ width: isCollapsed ? 80 : 256 }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className="sticky top-0 h-screen flex flex-col py-8 z-[100] border-r bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
            >
                {/* 1. LOGO */}
                <div className="px-6 mb-10 h-10 flex items-center">
                    <AnimatePresence mode="wait">
                        {!isCollapsed ? (
                            <motion.h1
                                key="logo"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 italic"
                            >
                                Zynon
                            </motion.h1>
                        ) : (
                            <motion.div key="dot" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-5 h-5 bg-zinc-900 dark:bg-zinc-100 rounded-full mx-auto" />
                        )}
                    </AnimatePresence>
                </div>

                {/* 2. NAVIGATION */}
                <nav className="flex-1 px-3 space-y-1.5">
                    {navItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link
                                key={item.label}
                                href={item.path}
                                onClick={item.onClick}
                                className={`group relative flex items-center rounded-xl transition-colors duration-500
                                    ${isCollapsed ? 'justify-center w-12 h-12 mx-auto' : 'px-3 py-2.5 gap-4 w-full'}
                                    ${isActive ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'}`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active-pill"
                                        className="absolute inset-0 bg-zinc-100/80 dark:bg-zinc-900/80 rounded-xl -z-10"
                                        transition={{ type: "spring", stiffness: 180, damping: 22 }}
                                    />
                                )}

                                <div className="relative flex-shrink-0">
                                    {item.icon}
                                    {item.badge && <span className="absolute -top-1 -right-1 bg-zinc-900 dark:bg-zinc-100 w-1.5 h-1.5 rounded-full" />}
                                </div>

                                {!isCollapsed && (
                                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[14px] font-medium">
                                        {item.label}
                                    </motion.span>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* 3. COLLAPSE TOGGLE */}
                <div className="px-3 mt-auto">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="flex items-center gap-4 px-3 py-3 w-full text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                        <motion.div animate={{ rotate: isCollapsed ? 180 : 0 }} transition={{ duration: 0.4 }}>
                            <MenuIcon />
                        </motion.div>
                        {!isCollapsed && <span className="text-[14px] font-medium">Collapse</span>}
                    </button>
                </div>
            </motion.aside>

            {/* --- LOGOUT MODAL --- */}
            <AnimatePresence>
                {showLogoutConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[120] flex items-center justify-center bg-black/30 backdrop-blur-[2px] p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.98, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.98, opacity: 0, y: 10 }}
                            className="bg-white dark:bg-zinc-950 p-8 rounded-[32px] max-w-sm w-full shadow-2xl border border-zinc-100 dark:border-zinc-900 text-center"
                        >
                            <h3 className="text-lg font-bold mb-1">Sign Out?</h3>
                            <p className="text-zinc-400 text-sm mb-8">Take a break from the universe.</p>

                            <div className="flex flex-col gap-2">
                                <button onClick={() => handleLogout(false)} className="w-full py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 rounded-2xl font-bold active:scale-[0.97] transition-all">
                                    Logout
                                </button>
                                <button onClick={() => handleLogout(true)} className="w-full py-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-2xl font-semibold text-sm active:scale-[0.97] transition-all">
                                    Logout from all devices
                                </button>
                                <button onClick={() => setShowLogoutConfirm(false)} className="w-full py-3 text-zinc-400 font-medium text-sm">
                                    Stay here
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

/* --- ICONS (Minimalist Stroke) --- */
const HomeIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
const ReelsIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M10 8l6 4-6 4V8z" /></svg>
const MessagesIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.7 8.38 8.38 0 0 1 3.8.9L21 3z" /></svg>
const ExploreIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>
const MenuIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
const SearchIcon = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
const HeartIcon = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
const PlusIcon = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
const LogoutIcon = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>