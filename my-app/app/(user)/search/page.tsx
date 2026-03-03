'use client'

import React, { useState } from 'react'

export default function SearchPage() {
    const [searchQuery, setSearchQuery] = useState("")

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 px-4 py-8 flex justify-center">
            <div className="max-w-[935px] w-full flex flex-col gap-8">

                {/* 1. SEARCH HEADER */}
                <div className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md pb-4 border-b border-zinc-100 dark:border-zinc-900">
                    <h1 className="text-2xl font-bold mb-6 px-2">Search</h1>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100 transition-colors">
                            <SearchIcon />
                        </div>
                        <input
                            type="text"
                            placeholder="Search accounts, hashtags, or places..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-zinc-100 dark:bg-zinc-900 border-none rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-800 transition-all outline-none"
                        />
                    </div>
                </div>

                {/* 2. RECENT / SUGGESTIONS SECTION */}
                {!searchQuery && (
                    <section className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="flex justify-between items-center mb-4 px-2">
                            <h2 className="text-sm font-bold">Recent</h2>
                            <button className="text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">Clear all</button>
                        </div>

                        <div className="space-y-2">
                            {[1, 2].map((i) => (
                                <div key={i} className="flex items-center justify-between p-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                                            <img src={`https://i.pravatar.cc/150?u=recent${i}`} className="grayscale group-hover:grayscale-0 transition-all" alt="user" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">minimal_concept_{i}</p>
                                            <p className="text-xs text-zinc-500">Suggested for you</p>
                                        </div>
                                    </div>
                                    <button className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
                                        <CloseIcon />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 3. EXPLORE / RESULTS GRID */}
                <section>
                    <h2 className="text-sm font-bold mb-4 px-2">{searchQuery ? 'Results' : 'Explore'}</h2>
                    <div className="grid grid-cols-3 gap-1 md:gap-4">
                        {[...Array(12)].map((_, i) => (
                            <div
                                key={i}
                                className={`relative aspect-square bg-zinc-100 dark:bg-zinc-900 overflow-hidden cursor-pointer group
                                    ${i === 1 ? 'row-span-2 col-span-1' : ''} // Creates that "Instagram Explore" variation
                                `}
                            >
                                <img
                                    src={`https://images.unsplash.com/photo-${1500000000000 + (i * 1234567)}?auto=format&fit=crop&w=500&q=80`}
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-in-out group-hover:scale-105"
                                    alt="Discovery content"
                                />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white font-bold">
                                    <span className="flex items-center gap-1"><HeartSolidIcon /> 2.4k</span>
                                    <span className="flex items-center gap-1"><CommentSolidIcon /> 128</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}

/* --- ICONS --- */
const SearchIcon = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
const CloseIcon = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" /></svg>
const HeartSolidIcon = () => <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
const CommentSolidIcon = () => <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 11-7.6-11.7 8.38 8.38 0 013.8.9L21 3z" /></svg>