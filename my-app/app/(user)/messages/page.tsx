'use client'

import React, { useState } from 'react'

export default function MessagesPage() {
    const [activeChat, setActiveChat] = useState(0)

    return (
        <div className="h-screen flex bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-hidden">
            
            {/* 1. CHAT LIST (Left Sidebar) */}
            <aside className="w-full md:w-80 lg:w-96 border-r border-zinc-100 dark:border-zinc-900 flex flex-col">
                <header className="p-6 flex items-center justify-between">
                    <h1 className="text-xl font-bold tracking-tight">Messages</h1>
                    <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors">
                        <NewMessageIcon />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    {[...Array(10)].map((_, i) => (
                        <div 
                            key={i}
                            onClick={() => setActiveChat(i)}
                            className={`flex items-center gap-4 px-6 py-4 cursor-pointer transition-all
                                ${activeChat === i ? 'bg-zinc-50 dark:bg-zinc-900' : 'hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50'}`}
                        >
                            <div className="relative flex-shrink-0">
                                <div className={`w-14 h-14 rounded-full overflow-hidden border-2 ${activeChat === i ? 'border-zinc-900 dark:border-zinc-100' : 'border-transparent'}`}>
                                    <img 
                                        src={`https://i.pravatar.cc/150?u=chat${i}`} 
                                        className={`w-full h-full object-cover transition-all duration-500 ${activeChat === i ? 'grayscale-0' : 'grayscale'}`} 
                                        alt="avatar" 
                                    />
                                </div>
                                {i < 3 && <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-zinc-950 rounded-full" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm ${i % 2 === 0 ? 'font-bold' : 'font-normal text-zinc-500'}`}>user_identifier_{i}</p>
                                <p className="text-xs text-zinc-400 truncate">Sent a photo • 2h</p>
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            {/* 2. CONVERSATION WINDOW (Right Content) */}
            <main className="hidden md:flex flex-1 flex-col relative">
                {/* Chat Header */}
                <header className="h-20 flex items-center justify-between px-6 border-b border-zinc-100 dark:border-zinc-900">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                            <img src={`https://i.pravatar.cc/150?u=chat${activeChat}`} className="grayscale-0" alt="active avatar" />
                        </div>
                        <div>
                            <p className="text-sm font-bold">user_identifier_{activeChat}</p>
                            <p className="text-[10px] text-zinc-400 font-medium tracking-wide uppercase">Active now</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-zinc-500">
                        <PhoneIcon />
                        <VideoIcon />
                        <InfoIcon />
                    </div>
                </header>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <Message isMe={false} text="Did you see the new architectural shots?" time="10:42 AM" />
                    <Message isMe={true} text="Just checked them out. The monochrome contrast is incredible." time="10:45 AM" />
                    <Message isMe={false} text="Exactly! I'm thinking of using a similar style for the next project." time="10:46 AM" />
                </div>

                {/* Input Area */}
                <footer className="p-6">
                    <div className="relative flex items-center gap-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl px-4 py-2 focus-within:border-zinc-400 transition-colors">
                        <button className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"><EmojiIcon /></button>
                        <input 
                            type="text" 
                            placeholder="Message..." 
                            className="flex-1 bg-transparent border-none outline-none text-sm py-2"
                        />
                        <div className="flex items-center gap-3 text-zinc-400">
                            <MicIcon />
                            <ImageIcon />
                            <HeartSmallIcon />
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    )
}

/* --- CHAT BUBBLE COMPONENT --- */

function Message({ isMe, text, time }: { isMe: boolean, text: string, time: string }) {
    return (
        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed
                ${isMe 
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-tr-none' 
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 rounded-tl-none'}`}>
                {text}
            </div>
            <span className="text-[10px] text-zinc-400 mt-1 px-1">{time}</span>
        </div>
    )
}

/* --- ICONS --- */
const NewMessageIcon = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
const PhoneIcon = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.81 12.81 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
const VideoIcon = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
const InfoIcon = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
const EmojiIcon = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
const MicIcon = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v1a7 7 0 01-14 0v-1M12 19v4M8 23h8"/></svg>
const ImageIcon = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
const HeartSmallIcon = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>