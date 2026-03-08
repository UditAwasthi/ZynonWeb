'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Home, Search, Compass, Play,
    MessageSquare, Heart, PlusSquare,
    LogOut, Menu, ChevronLeft, Shield
} from 'lucide-react'
import { cachedApiFetch } from '@/lib/api'

interface NavItem {
    label: string;
    path: string;
    icon: React.ElementType;
    badge?: string;
    onClick?: () => void;
}

interface ProfileResponse {
    data: { profilePicture: string };
}

export default function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
    const [avatar, setAvatar] = useState<string | null>(null)

    useEffect(() => {
        const loadAvatar = async () => {
            const token = localStorage.getItem("accessToken")
            if (!token) return
            try {
                const { data } = await cachedApiFetch(
                    "https://zynon.onrender.com/api/profile/me",
                    { headers: { Authorization: `Bearer ${token}` } }
                )
                const typedData = data as ProfileResponse
                setAvatar(typedData.data.profilePicture)
            } catch (err) {
                console.error("failed to load avatar", err)
            }
        }
        loadAvatar()
    }, [])

    const handleLogout = async (allDevices = false) => {
        const endpoint = allDevices ? "/api/auth/logout-all" : "/api/auth/logout"
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
        try { localStorage.clear() } catch { }
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

    const NavLink = ({ item }: { item: NavItem }) => {
        const isActive = pathname === item.path
        const Icon = item.icon
        return (
            <Link
                href={item.path}
                onClick={item.onClick}
                className={`
                    group relative flex items-center rounded-2xl transition-all duration-200
                    ${isCollapsed
                        ? 'justify-center mx-auto'
                        : 'px-4 gap-4 w-full'
                    }
                    ${isActive
                        ? 'text-blue-500'
                        : 'text-zinc-500 hover:text-zinc-100'
                    }
                `}
                style={{
                    height: 48,
                    width: isCollapsed ? 48 : '100%',
                }}
            >
                {isActive && (
                    <motion.div
                        layoutId="sidebar-active"
                        className="absolute inset-0 bg-blue-500/[0.08] border border-blue-500/20 rounded-2xl"
                        style={{ zIndex: 0 }}
                    />
                )}

                <span className="relative z-10 flex-shrink-0">
                    <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                    {item.badge && (
                        <span className="absolute -top-1 -right-1 bg-red-500 w-2 h-2 rounded-full border-2 border-[#080808]" />
                    )}
                </span>

                {!isCollapsed && (
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.15 }}
                        className={`relative z-10 text-sm font-bold tracking-tight whitespace-nowrap ${isActive ? 'italic' : ''}`}
                    >
                        {item.label}
                    </motion.span>
                )}
            </Link>
        )
    }

    return (
        <>
            <motion.aside
                layout
                initial={false}
                animate={{ width: isCollapsed ? 76 : 240 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{
                    position: 'sticky',
                    top: 0,
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    flexShrink: 0,
                    overflow: 'hidden',
                    zIndex: 100,
                    borderRight: '1px solid rgba(255,255,255,0.06)',
                    backgroundColor: '#080808',
                    paddingTop: 24,
                    paddingBottom: 20,
                }}
            >
                {/* 1. LOGO */}
                <div
                    style={{
                        height: 48,
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: isCollapsed ? 0 : 20,
                        paddingRight: isCollapsed ? 0 : 20,
                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                        marginBottom: 32,
                        flexShrink: 0,
                    }}
                >
                    <AnimatePresence mode="wait">
                        {!isCollapsed ? (
                            <motion.div
                                key="logo-full"
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -8 }}
                                transition={{ duration: 0.15 }}
                                style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                            >
                                <div style={{
                                    width: 34, height: 34,
                                    background: '#2563eb',
                                    borderRadius: 10,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                    boxShadow: '0 4px 14px rgba(37,99,235,0.4)'
                                }}>
                                    <span style={{ color: '#fff', fontWeight: 900, fontSize: 18, fontStyle: 'italic' }}>Z</span>
                                </div>
                                <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.5px', fontStyle: 'italic', color: '#fff' }}>
                                    ZYNON
                                </span>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="logo-icon"
                                initial={{ scale: 0.7, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.7, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                style={{
                                    width: 34, height: 34,
                                    background: '#2563eb',
                                    borderRadius: 10,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 4px 14px rgba(37,99,235,0.4)'
                                }}
                            >
                                <span style={{ color: '#fff', fontWeight: 900, fontSize: 18, fontStyle: 'italic' }}>Z</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 2. MAIN NAV */}
                <nav
                    style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        paddingLeft: isCollapsed ? 14 : 12,
                        paddingRight: isCollapsed ? 14 : 12,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                    }}
                >
                    {navItems.map(item => <NavLink key={item.label} item={item} />)}
                </nav>

                {/* 3. FOOTER */}
                <div
                    style={{
                        flexShrink: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        paddingLeft: isCollapsed ? 14 : 12,
                        paddingRight: isCollapsed ? 14 : 12,
                        marginTop: 8,
                    }}
                >
                    {/* PROFILE */}
                    <Link
                        href="/profile"
                        style={{
                            height: 48,
                            display: 'flex',
                            alignItems: 'center',
                            gap: isCollapsed ? 0 : 14,
                            justifyContent: isCollapsed ? 'center' : 'flex-start',
                            borderRadius: 16,
                            paddingLeft: isCollapsed ? 0 : 16,
                            paddingRight: isCollapsed ? 0 : 16,
                            width: isCollapsed ? 48 : '100%',
                            marginLeft: isCollapsed ? 'auto' : 0,
                            marginRight: isCollapsed ? 'auto' : 0,
                            color: pathname === '/profile' ? '#3b82f6' : '#71717a',
                            textDecoration: 'none',
                            transition: 'color 0.2s',
                            position: 'relative',
                        }}
                        className="hover:text-zinc-100"
                    >
                        <div style={{
                            width: 28, height: 28,
                            borderRadius: '50%',
                            overflow: 'hidden',
                            flexShrink: 0,
                            outline: pathname === '/profile' ? '2px solid #3b82f6' : '2px solid rgba(255,255,255,0.12)',
                            outlineOffset: 1,
                        }}>
                            <img
                                src={avatar || "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=100&q=80"}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                alt="Profile"
                            />
                        </div>
                        {!isCollapsed && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.2px', whiteSpace: 'nowrap' }}
                            >
                                Profile
                            </motion.span>
                        )}
                    </Link>

                    {/* LOGOUT */}
                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        style={{
                            height: 48,
                            display: 'flex',
                            alignItems: 'center',
                            gap: isCollapsed ? 0 : 14,
                            justifyContent: isCollapsed ? 'center' : 'flex-start',
                            borderRadius: 16,
                            paddingLeft: isCollapsed ? 0 : 16,
                            paddingRight: isCollapsed ? 0 : 16,
                            width: isCollapsed ? 48 : '100%',
                            marginLeft: isCollapsed ? 'auto' : 0,
                            marginRight: isCollapsed ? 'auto' : 0,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#71717a',
                            transition: 'color 0.2s',
                        }}
                        className="hover:text-red-400"
                    >
                        <LogOut size={20} />
                        {!isCollapsed && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.2px', whiteSpace: 'nowrap' }}
                            >
                                Logout
                            </motion.span>
                        )}
                    </button>

                    {/* DIVIDER */}
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 4px' }} />

                    {/* COLLAPSE TOGGLE */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        style={{
                            height: 44,
                            display: 'flex',
                            alignItems: 'center',
                            gap: isCollapsed ? 0 : 14,
                            justifyContent: isCollapsed ? 'center' : 'flex-start',
                            borderRadius: 16,
                            paddingLeft: isCollapsed ? 0 : 16,
                            paddingRight: isCollapsed ? 0 : 16,
                            width: isCollapsed ? 48 : '100%',
                            marginLeft: isCollapsed ? 'auto' : 0,
                            marginRight: isCollapsed ? 'auto' : 0,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#52525b',
                            transition: 'color 0.2s',
                        }}
                        className="hover:text-zinc-300"
                    >
                        <motion.div animate={{ rotate: isCollapsed ? 180 : 0 }} transition={{ duration: 0.25 }}>
                            <ChevronLeft size={18} />
                        </motion.div>
                        {!isCollapsed && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.5 }}
                            >
                                Collapse
                            </motion.span>
                        )}
                    </button>
                </div>
            </motion.aside>

            {/* LOGOUT MODAL */}
            <AnimatePresence>
                {showLogoutConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 200,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(0,0,0,0.7)',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                            padding: 16,
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.92, opacity: 0, y: 16 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.92, opacity: 0, y: 16 }}
                            style={{
                                background: '#0c0c0c',
                                padding: 32,
                                borderRadius: 32,
                                maxWidth: 360,
                                width: '100%',
                                boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                textAlign: 'center',
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                        >
                            <div style={{
                                position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                                background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.6), transparent)'
                            }} />

                            <div style={{
                                width: 60, height: 60,
                                background: 'rgba(239,68,68,0.1)',
                                borderRadius: 20,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 20px',
                            }}>
                                <Shield size={26} color="#ef4444" />
                            </div>

                            <h3 style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.3px', fontStyle: 'italic', color: '#fff', textTransform: 'uppercase' }}>
                                Secure Sign Out
                            </h3>
                            <p style={{ color: '#71717a', fontSize: 14, marginTop: 8, marginBottom: 28, lineHeight: 1.5 }}>
                                Are you sure you want to disconnect from the Zynon network?
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <button
                                    onClick={() => handleLogout(false)}
                                    style={{
                                        width: '100%', padding: '14px 0',
                                        background: '#fff', color: '#000',
                                        border: 'none', borderRadius: 16,
                                        fontSize: 12, fontWeight: 800,
                                        letterSpacing: '0.1em', textTransform: 'uppercase',
                                        cursor: 'pointer', transition: 'opacity 0.15s',
                                    }}
                                    className="hover:opacity-90 active:scale-[0.98]"
                                >
                                    End Session
                                </button>
                                <button
                                    onClick={() => handleLogout(true)}
                                    style={{
                                        width: '100%', padding: '12px 0',
                                        background: 'none', border: 'none',
                                        color: '#ef4444', fontSize: 12, fontWeight: 700,
                                        letterSpacing: '0.05em', textTransform: 'uppercase',
                                        cursor: 'pointer', opacity: 0.7, transition: 'opacity 0.15s',
                                    }}
                                    className="hover:opacity-100"
                                >
                                    Sign out all devices
                                </button>
                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    style={{
                                        width: '100%', padding: '12px 0',
                                        background: 'none', border: 'none',
                                        color: '#52525b', fontSize: 12, fontWeight: 700,
                                        letterSpacing: '0.1em', textTransform: 'uppercase',
                                        cursor: 'pointer',
                                    }}
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