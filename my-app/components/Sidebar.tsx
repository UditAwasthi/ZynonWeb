'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
    label: string;
    path: string;
    icon: React.ReactNode;
    badge?: string;
    onClick?: () => void;
}

export default function Sidebar() {
    const pathname = usePathname()
    const [isCollapsed, setIsCollapsed] = useState(false)

    const navItems: NavItem[] = [
        { label: 'Home', path: '/home', icon: <HomeIcon /> },
        {
            label: 'Search',
            path: '/search',
            icon: <SearchIcon />,
            onClick: () => setIsCollapsed(false) // Expand when searching
        },
        { label: 'Explore', path: '/explore', icon: <ExploreIcon /> },
        { label: 'Reels', path: '/reels', icon: <ReelsIcon /> },
        {
            label: 'Messages',
            path: '/messages',
            icon: <MessagesIcon />,
            badge: "9+"
        },
        { label: 'Notifications', path: '/notifications', icon: <HeartIcon /> },
        { label: 'Create', path: '/create', icon: <PlusIcon /> },
        {
            label: 'Profile',
            path: '/profile',
            icon: (
                <div className="w-6 h-6 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800 group-hover:border-zinc-400 transition-colors">
                    <img
                        src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=100&q=80"
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                        alt="Profile"
                    />
                </div>
            )
        },
    ]

    return (
        <aside
            className={`sticky top-0 h-screen flex flex-col py-8 z-[100] border-r transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
            ${isCollapsed ? 'w-[72px]' : 'w-64'} 
            bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800`}
        >
            {/* 1. LOGO SECTION */}
            <div className="px-6 mb-10 h-10 flex items-center overflow-hidden">
                {isCollapsed ? (
                    <div className="min-w-[24px] h-6 w-6 bg-zinc-900 dark:bg-zinc-100 rounded-md flex-shrink-0" />
                ) : (
                    <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 italic transition-opacity duration-300">
                        Instagram
                    </h1>
                )}
            </div>

            {/* 2. NAVIGATION */}
            <nav className="flex-1 px-3 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <Link
                            key={item.label}
                            href={item.path}
                            onClick={() => item.onClick?.()}
                            className={`flex items-center rounded-xl transition-all duration-200 group relative
                                ${isCollapsed ? 'justify-center w-12 h-12 mx-auto' : 'px-3 py-3 gap-4'}
                                ${isActive
                                    ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100'
                                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-zinc-100'}`}
                        >
                            <div className="relative flex-shrink-0">
                                {item.icon}
                                {item.badge && (
                                    <span className="absolute -top-1.5 -right-1.5 bg-zinc-900 dark:bg-zinc-100 text-[10px] text-white dark:text-zinc-950 px-1 rounded-full font-bold border-2 border-white dark:border-zinc-950">
                                        {item.badge}
                                    </span>
                                )}
                            </div>

                            {/* Label - Hidden when collapsed */}
                            <span className={`text-[15px] whitespace-nowrap transition-all duration-300 overflow-hidden
                                ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100 font-medium'}`}>
                                {item.label}
                            </span>

                            {/* Tooltip - Only visible when collapsed on hover */}
                            {isCollapsed && (
                                <div className="absolute left-14 invisible group-hover:visible opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs py-1.5 px-3 rounded-md whitespace-nowrap z-50 pointer-events-none shadow-sm">
                                    {item.label}
                                </div>
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* 3. FOOTER / TOGGLE */}
            <div className="px-3 mt-auto">
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={`flex items-center rounded-xl transition-all text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100
                    ${isCollapsed ? 'justify-center w-12 h-12 mx-auto' : 'px-3 py-3 gap-4 w-full'}`}
                >
                    <MenuIcon />
                    {!isCollapsed && <span className="text-[15px] font-medium">Collapse Sidebar</span>}
                </button>
            </div>
        </aside>
    )
}

/* --- ICONS --- */
const HomeIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
const ReelsIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M10 8l6 4-6 4V8z" /></svg>
const MessagesIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.7 8.38 8.38 0 0 1 3.8.9L21 3z" /></svg>
const ExploreIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>
const MenuIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
const SearchIcon = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
const HeartIcon = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
const PlusIcon = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>