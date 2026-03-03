'use client'

import React from 'react'

export default function ReelsPage() {
    return (
        <div className="h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide bg-white dark:bg-zinc-950">
            {[...Array(5)].map((_, i) => (
                <section
                    key={i}
                    className="h-screen w-full flex justify-center items-center snap-start py-4 md:py-8"
                >
                    <div className="relative h-full aspect-[9/16] bg-zinc-900 rounded-none md:rounded-xl overflow-hidden shadow-2xl flex group">

                        {/* 1. MOCK VIDEO BACKGROUND */}
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-black/20 via-transparent to-black/60">
                            <img
                                src={`https://images.unsplash.com/photo-${1500000000000 + (i * 555)}?auto=format&fit=crop&w=800&q=80`}
                                className="w-full h-full object-cover grayscale brightness-75 transition-all duration-1000 group-hover:grayscale-0 group-hover:brightness-100"
                                alt="Reel Content"
                            />
                        </div>

                        {/* 2. OVERLAY CONTENT (Bottom) */}
                        <div className="absolute bottom-0 left-0 w-full p-4 text-white space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full border border-white/50 overflow-hidden">
                                    <img src={`https://i.pravatar.cc/150?u=reeler${i}`} alt="avatar" />
                                </div>
                                <span className="font-bold text-sm">monochrome_creator</span>
                                <button className="text-xs border border-white/30 px-3 py-1 rounded-lg hover:bg-white/10 transition-all">
                                    Follow
                                </button>
                            </div>
                            <p className="text-sm line-clamp-2 text-zinc-200">
                                This is a minimalist perspective on motion. #monochrome #reels #aesthetic
                            </p>
                            <div className="flex items-center gap-2 text-xs">
                                <MusicIcon />
                                <span>Original Audio - artist_name</span>
                            </div>
                        </div>

                        {/* 3. SIDE ACTIONS (Right) */}
                        <div className="absolute bottom-6 right-2 flex flex-col items-center gap-6 text-white px-2">
                            <ActionButton icon={<HeartIcon />} count="124k" />
                            <ActionButton icon={<MessageIcon />} count="1.2k" />
                            <ActionButton icon={<ShareIcon />} />
                            <ActionButton icon={<MoreIcon />} />
                            <div className="w-8 h-8 rounded-md border-2 border-white overflow-hidden mt-2">
                                <img src={`https://i.pravatar.cc/150?u=music${i}`} className="grayscale" alt="audio" />
                            </div>
                        </div>
                    </div>
                </section>
            ))}
        </div>
    )
}

/* --- REEL COMPONENTS --- */

function ActionButton({ icon, count }: { icon: React.ReactNode, count?: string }) {
    return (
        <div className="flex flex-col items-center gap-1 cursor-pointer group">
            <div className="p-2 group-hover:bg-white/10 rounded-full transition-all">
                {icon}
            </div>
            {count && <span className="text-[12px] font-medium">{count}</span>}
        </div>
    )
}

const MusicIcon = () => (
    <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" /></svg>
)

const HeartIcon = () => (
    <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
)

const MessageIcon = () => (
    <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.7 8.38 8.38 0 0 1 3.8.9L21 3z" /></svg>
)

const ShareIcon = () => (
    <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
)

const MoreIcon = () => (
    <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="19" r="1.5" /></svg>
)