'use client'

import React from 'react'

export default function ExplorePage() {
    // Mock data for different categories
    const categories = ["Architecture", "Portrait", "Nature", "Industrial", "Minimal"];

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 px-4 py-6 flex justify-center">
            <div className="max-w-[935px] w-full flex flex-col gap-6">

                {/* 1. CATEGORY CHIPS */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            className="px-6 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all whitespace-nowrap"
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* 2. EXPLORE GRID (Tiled Pattern) */}
                <div className="grid grid-cols-3 gap-1 md:gap-6">
                    {[...Array(18)].map((_, i) => {
                        // Pattern: Make the 3rd and 10th item larger (spanning 2 rows and 2 columns)
                        const isLarge = i === 2 || i === 9;

                        return (
                            <div
                                key={i}
                                className={`group relative overflow-hidden bg-zinc-100 dark:bg-zinc-900 rounded-sm md:rounded-lg cursor-pointer
                                    ${isLarge ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'}
                                `}
                            >
                                {/* Image with monochrome reveal */}
                                <img
                                    src={`https://images.unsplash.com/photo-${1500000000000 + (i * 98765)}?auto=format&fit=crop&w=${isLarge ? '1000' : '500'}&q=80`}
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-out group-hover:scale-110"
                                    alt="Explore content"
                                />

                                {/* Overlay on Hover */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-6 text-white font-medium">
                                    <div className="flex items-center gap-2">
                                        <HeartIconSolid />
                                        <span className="text-sm">421</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CommentIconSolid />
                                        <span className="text-sm">12</span>
                                    </div>
                                </div>

                                {/* Video Icon Indicator (Optional for Reels-like look) */}
                                {i % 4 === 0 && (
                                    <div className="absolute top-3 right-3 text-white drop-shadow-md">
                                        <VideoIcon />
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

/* --- EXPLORE SPECIFIC ICONS --- */

const HeartIconSolid = () => (
    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
)

const CommentIconSolid = () => (
    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
        <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 11-7.6-11.7 8.38 8.38 0 013.8.9L21 3z" />
    </svg>
)

const VideoIcon = () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
)