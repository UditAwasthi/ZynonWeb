'use client'

import React, { useState } from 'react'

export default function CreatePage() {
    const [dragActive, setDragActive] = useState(false)

    return (
        <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 flex items-center justify-center p-4">
            <div className="max-w-[500px] w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col">
                
                {/* Header */}
                <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                    <span className="text-sm font-bold">Create new post</span>
                    <button className="text-sm font-bold text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                        Next
                    </button>
                </div>

                {/* Upload Zone */}
                <div 
                    className={`flex-1 min-h-[400px] flex flex-col items-center justify-center gap-6 p-10 transition-all
                        ${dragActive ? 'bg-zinc-100 dark:bg-zinc-800' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => { e.preventDefault(); setDragActive(false); }}
                >
                    <div className="text-zinc-300 dark:text-zinc-600">
                        <UploadIcon />
                    </div>
                    
                    <div className="text-center space-y-2">
                        <p className="text-lg font-medium text-zinc-500">Drag photos and videos here</p>
                        <button className="px-5 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-bold rounded-lg hover:opacity-80 transition-opacity">
                            Select from computer
                        </button>
                    </div>
                </div>

                {/* Footer Tip */}
                <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 text-center">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
                        Maximum file size: 20MB
                    </p>
                </div>
            </div>
        </div>
    )
}

/* --- ICONS --- */
const UploadIcon = () => (
    <svg width="96" height="77" viewBox="0 0 96 77" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M1 10C1 5.02944 5.02944 1 10 1H86C90.9706 1 95 5.02944 95 10V67C95 71.9706 90.9706 76 86 76H10C5.02944 76 1 71.9706 1 67V10Z" />
        <path d="M30 30L48 12L66 30" strokeWidth="2" />
        <path d="M48 12V50" strokeWidth="2" />
        <path d="M25 58H71" strokeWidth="2" />
    </svg>
)