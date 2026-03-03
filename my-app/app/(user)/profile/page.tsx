'use client'

import React from 'react'

export default function ProfilePage() {
    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex justify-center py-8 px-4 md:px-8">
            <div className="max-w-[935px] w-full flex flex-col gap-12">
                
                {/* 1. PROFILE HEADER */}
                <header className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-20 px-4">
                    {/* Avatar */}
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-zinc-100 dark:border-zinc-900 p-1 flex-shrink-0">
                        <div className="w-full h-full rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                            <img 
                                src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=400&q=80" 
                                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                                alt="Profile Avatar"
                            />
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex flex-col gap-6 text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <h2 className="text-xl font-light tracking-tight">monochrome_studio</h2>
                            <div className="flex gap-2">
                                <button className="px-4 py-1.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg text-sm font-semibold transition-colors">
                                    Edit Profile
                                </button>
                                <button className="p-2 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                                    <SettingsIcon />
                                </button>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex justify-center md:justify-start gap-8 border-y md:border-none py-4 md:py-0 border-zinc-100 dark:border-zinc-900">
                            <Stat number="42" label="posts" />
                            <Stat number="12.4k" label="followers" />
                            <Stat number="842" label="following" />
                        </div>

                        {/* Bio */}
                        <div className="text-sm space-y-1">
                            <p className="font-bold">Monochrome Studio</p>
                            <p className="text-zinc-500 dark:text-zinc-400">Architectural Photography & Digital Minimalism.</p>
                            <a href="#" className="text-zinc-900 dark:text-zinc-100 font-semibold hover:underline decoration-zinc-400">monochromestudio.co</a>
                        </div>
                    </div>
                </header>

                {/* 2. TAB NAVIGATION */}
                <div className="border-t border-zinc-100 dark:border-zinc-900 flex justify-center gap-12">
                    <TabItem icon={<GridIcon />} label="POSTS" active />
                    <TabItem icon={<ReelsSmallIcon />} label="REELS" />
                    <TabItem icon={<BookmarkSmallIcon />} label="SAVED" />
                </div>

                {/* 3. PROFILE GRID */}
                <div className="grid grid-cols-3 gap-1 md:gap-4">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="group relative aspect-square bg-zinc-100 dark:bg-zinc-900 overflow-hidden cursor-pointer">
                            <img 
                                src={`https://images.unsplash.com/photo-${1550000000000 + (i * 1234)}?auto=format&fit=crop&w=600&q=80`} 
                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-in-out group-hover:scale-105"
                                alt="Post"
                            />
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white font-bold">
                                <div className="flex items-center gap-1"><HeartSolid /> 142</div>
                                <div className="flex items-center gap-1"><CommentSolid /> 28</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

/* --- UI HELPERS --- */

function Stat({ number, label }: { number: string, label: string }) {
    return (
        <div className="flex flex-col md:flex-row md:gap-1 items-center">
            <span className="font-bold">{number}</span>
            <span className="text-zinc-500 dark:text-zinc-400 text-sm">{label}</span>
        </div>
    )
}

function TabItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <div className={`flex items-center gap-2 py-4 cursor-pointer transition-all border-t-2 -mt-[2px] 
            ${active ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-bold' : 'border-transparent text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'}`}>
            {icon}
            <span className="text-[12px] tracking-widest">{label}</span>
        </div>
    )
}

/* --- ICONS --- */
const SettingsIcon = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
const GridIcon = () => <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zm-11 11h7v7H3v-7zm11 0h7v7h-7v-7z"/></svg>
const ReelsSmallIcon = () => <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M10 8l6 4-6 4V8z"/></svg>
const BookmarkSmallIcon = () => <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
const HeartSolid = () => <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
const CommentSolid = () => <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 11-7.6-11.7 8.38 8.38 0 013.8.9L21 3z"/></svg>