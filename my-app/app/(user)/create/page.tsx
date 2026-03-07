'use client'

import React, { useState, useRef, useCallback } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://zynon.onrender.com/api/content'

/* ─── ICONS ─── */
const UploadIcon = () => (
    <svg width="64" height="52" viewBox="0 0 96 77" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M1 10C1 5.02944 5.02944 1 10 1H86C90.9706 1 95 5.02944 95 10V67C95 71.9706 90.9706 76 86 76H10C5.02944 76 1 71.9706 1 67V10Z" />
        <path d="M30 30L48 12L66 30" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M48 12V50" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M25 60H71" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
)

const CloseIcon = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M1 1L13 13M13 1L1 13" />
    </svg>
)

const ChevronLeft = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
    </svg>
)

const ChevronRight = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18l6-6-6-6" />
    </svg>
)

const CheckIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l-5-5" />
    </svg>
)

const ImageIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
    </svg>
)

const VideoIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" />
    </svg>
)

const GlobeIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
)

const UsersIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
)

/* ─── STEPS ─── */
const STEPS = { UPLOAD: 'upload', CAPTION: 'caption', SUCCESS: 'success' }

/* ─── MAIN COMPONENT ─── */
export default function CreatePage() {
    const [step, setStep] = useState(STEPS.UPLOAD)
    const [files, setFiles] = useState<Array<{ file: File; preview: string; type: 'image' | 'video' }>>([])
    const [activeIdx, setActiveIdx] = useState(0)
    const [caption, setCaption] = useState('')
    const [visibility, setVisibility] = useState('public')
    const [dragActive, setDragActive] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    /* ─── FILE HANDLING ─── */
    const addFiles = useCallback((incoming: FileList) => {
        setError('')
        const valid = Array.from(incoming).filter((f): f is File => {
            if (!f.type.startsWith('image/') && !f.type.startsWith('video/')) return false
            if (f.size > 20 * 1024 * 1024) { setError(`"${f.name}" exceeds 20 MB`); return false }
            return true
        })

        setFiles(prev => {
            const combined = [...prev, ...valid.map(f => {
                const type = f.type.startsWith('image/') ? 'image' : 'video'
                return {
                    file: f,
                    preview: URL.createObjectURL(f),
                    type: type as 'image' | 'video'
                }
            })]
            if (combined.length > 10) {
                setError('Maximum 10 files allowed')
                return combined.slice(0, 10)
            }
            return combined
        })
    }, [])

    const removeFile = (idx: number) => {
        setFiles(prev => {
            URL.revokeObjectURL(prev[idx].preview)
            const next = prev.filter((_, i) => i !== idx)
            setActiveIdx(i => Math.min(i, Math.max(0, next.length - 1)))
            return next
        })
    }

    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); setDragActive(false)
        addFiles(e.dataTransfer.files)
    }

    /* ─── SUBMIT ─── */
    const handleSubmit = async () => {
        if (!files.length) return
        setLoading(true); setError('')

        try {
            const formData = new FormData()
            files.forEach(f => formData.append('media', f.file))
            formData.append('caption', caption)
            formData.append('visibility', visibility)

            const token = localStorage.getItem("accessToken")

            const res = await fetch(`${API_BASE}/posts`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Upload failed')
            setStep(STEPS.SUCCESS)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    /* ─── RESET ─── */
    const reset = () => {
        files.forEach(f => URL.revokeObjectURL(f.preview))
        setFiles([]); setCaption(''); setVisibility('public')
        setActiveIdx(0); setError(''); setStep(STEPS.UPLOAD)
    }

    /* ─── RENDER ─── */
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4"
            style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
                @keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
                @keyframes scaleIn { from { opacity:0; transform:scale(.92) } to { opacity:1; transform:scale(1) } }
                @keyframes spin { to { transform: rotate(360deg) } }
                .fade-up { animation: fadeUp .35s cubic-bezier(.22,1,.36,1) both }
                .scale-in { animation: scaleIn .4s cubic-bezier(.22,1,.36,1) both }
                .spinner { animation: spin .9s linear infinite }
                .thumb::-webkit-scrollbar { height:4px }
                .thumb::-webkit-scrollbar-track { background:transparent }
                .thumb::-webkit-scrollbar-thumb { background:#d4d4d8; border-radius:99px }
            `}</style>

            <div className="max-w-[480px] w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden flex flex-col scale-in">

                {/* ── HEADER ── */}
                <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <button
                        onClick={step === STEPS.CAPTION ? () => setStep(STEPS.UPLOAD) : undefined}
                        className={`flex items-center gap-1 text-sm font-medium transition-colors
                            ${step === STEPS.CAPTION ? 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer' : 'text-transparent pointer-events-none'}`}
                    >
                        <ChevronLeft /> Back
                    </button>

                    <span className="text-sm font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
                        {step === STEPS.SUCCESS ? 'Posted!' : 'Create new post'}
                    </span>

                    {step === STEPS.UPLOAD && (
                        <button
                            disabled={!files.length}
                            onClick={() => setStep(STEPS.CAPTION)}
                            className="text-sm font-bold text-blue-500 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    )}
                    {step === STEPS.CAPTION && (
                        <button
                            disabled={loading}
                            onClick={handleSubmit}
                            className="text-sm font-bold text-blue-500 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                        >
                            {loading
                                ? <svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" /></svg>
                                : 'Share'
                            }
                        </button>
                    )}
                    {step === STEPS.SUCCESS && <div className="w-12" />}
                </div>

                {/* ── STEP: UPLOAD ── */}
                {step === STEPS.UPLOAD && (
                    <div className="flex-1 flex flex-col fade-up">
                        {/* Drop zone */}
                        {!files.length ? (
                            <div
                                onDragOver={e => { e.preventDefault(); setDragActive(true) }}
                                onDragLeave={() => setDragActive(false)}
                                onDrop={onDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`flex-1 min-h-[360px] flex flex-col items-center justify-center gap-5 p-10 cursor-pointer transition-all duration-200
                                    ${dragActive ? 'bg-blue-50 dark:bg-blue-950/30' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/30'}`}
                            >
                                <div className={`transition-colors duration-200 ${dragActive ? 'text-blue-400' : 'text-zinc-300 dark:text-zinc-600'}`}>
                                    <UploadIcon />
                                </div>
                                <div className="text-center space-y-3">
                                    <p className="text-base font-medium text-zinc-400 dark:text-zinc-500">
                                        {dragActive ? 'Drop to upload' : 'Drag photos & videos here'}
                                    </p>
                                    <button
                                        onClick={e => { e.stopPropagation(); fileInputRef.current?.click() }}
                                        className="px-5 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-bold rounded-lg hover:opacity-80 active:scale-95 transition-all"
                                    >
                                        Select from computer
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Preview carousel */
                            <div className="flex-1 flex flex-col">
                                {/* Main preview */}
                                <div className="relative bg-zinc-100 dark:bg-zinc-800 aspect-square">
                                    {files[activeIdx]?.type === 'image'
                                        ? <img src={files[activeIdx].preview} alt="" className="w-full h-full object-contain" />
                                        : <video src={files[activeIdx].preview} controls className="w-full h-full object-contain" />
                                    }

                                    {/* Nav arrows */}
                                    {files.length > 1 && (
                                        <>
                                            <button onClick={() => setActiveIdx(i => Math.max(0, i - 1))}
                                                disabled={activeIdx === 0}
                                                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white disabled:opacity-0 transition-all">
                                                <ChevronLeft />
                                            </button>
                                            <button onClick={() => setActiveIdx(i => Math.min(files.length - 1, i + 1))}
                                                disabled={activeIdx === files.length - 1}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white disabled:opacity-0 transition-all">
                                                <ChevronRight />
                                            </button>
                                            {/* Dots */}
                                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                                {files.map((_, i) => (
                                                    <button key={i} onClick={() => setActiveIdx(i)}
                                                        className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeIdx ? 'bg-white w-3' : 'bg-white/50'}`} />
                                                ))}
                                            </div>
                                        </>
                                    )}

                                    {/* Type badge */}
                                    <div className="absolute top-2 left-2 bg-black/50 text-white rounded-md px-2 py-1 flex items-center gap-1 text-xs font-medium">
                                        {files[activeIdx]?.type === 'image' ? <ImageIcon /> : <VideoIcon />}
                                        {files[activeIdx]?.type}
                                    </div>
                                </div>

                                {/* Thumbnails */}
                                <div className="p-3 flex gap-2 overflow-x-auto thumb">
                                    {files.map((f, i) => (
                                        <div key={i} onClick={() => setActiveIdx(i)}
                                            className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden cursor-pointer transition-all
                                                ${i === activeIdx ? 'ring-2 ring-blue-500 ring-offset-1' : 'opacity-60 hover:opacity-100'}`}
                                        >
                                            {f.type === 'image'
                                                ? <img src={f.preview} alt="" className="w-full h-full object-cover" />
                                                : <video src={f.preview} className="w-full h-full object-cover" />
                                            }
                                            <button
                                                onClick={e => { e.stopPropagation(); removeFile(i) }}
                                                className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/70 hover:bg-black rounded-full flex items-center justify-center text-white transition-colors"
                                            >
                                                <CloseIcon />
                                            </button>
                                        </div>
                                    ))}

                                    {/* Add more */}
                                    {files.length < 10 && (
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex-shrink-0 w-16 h-16 rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-600 flex items-center justify-center text-zinc-400 hover:border-blue-400 hover:text-blue-400 transition-colors"
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="mx-4 mb-3 px-4 py-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
                                {error}
                            </div>
                        )}

                        {/* Footer */}
                        <div className="px-5 py-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400 font-medium uppercase tracking-widest">
                            <span>Max 20 MB per file</span>
                            <span>{files.length}/10 files</span>
                        </div>
                    </div>
                )}

                {/* ── STEP: CAPTION ── */}
                {step === STEPS.CAPTION && (
                    <div className="flex flex-col fade-up">
                        {/* Media mini-preview */}
                        <div className="px-5 pt-4 pb-3">
                            <div className="flex gap-2 overflow-x-auto thumb pb-1">
                                {files.map((f, i) => (
                                    <div key={i} className="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                                        {f.type === 'image'
                                            ? <img src={f.preview} alt="" className="w-full h-full object-cover" />
                                            : <video src={f.preview} className="w-full h-full object-cover" />
                                        }
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="border-t border-zinc-100 dark:border-zinc-800" />

                        {/* Caption */}
                        <div className="px-5 pt-4">
                            <textarea
                                value={caption}
                                onChange={e => setCaption(e.target.value)}
                                maxLength={2200}
                                placeholder="Write a caption..."
                                rows={5}
                                className="w-full resize-none bg-transparent text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 outline-none leading-relaxed"
                            />
                            <div className="text-right text-[11px] text-zinc-400 font-medium mb-3">
                                {caption.length}/2200
                            </div>
                        </div>

                        <div className="border-t border-zinc-100 dark:border-zinc-800" />

                        {/* Visibility */}
                        <div className="px-5 py-4">
                            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Audience</p>
                            <div className="flex gap-2">
                                {[
                                    { value: 'public', label: 'Everyone', Icon: GlobeIcon },
                                    { value: 'followers', label: 'Followers', Icon: UsersIcon }
                                ].map(({ value, label, Icon }) => (
                                    <button
                                        key={value}
                                        onClick={() => setVisibility(value)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all
                                            ${visibility === value
                                                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-transparent'
                                                : 'bg-white dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'
                                            }`}
                                    >
                                        <Icon /> {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="mx-5 mb-4 px-4 py-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
                                {error}
                            </div>
                        )}

                        {/* Share button (mobile-friendly big tap target) */}
                        <div className="px-5 pb-5">
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-bold rounded-xl
                                    hover:opacity-80 active:scale-[.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                {loading
                                    ? <><svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" /></svg> Sharing…</>
                                    : 'Share'
                                }
                            </button>
                        </div>
                    </div>
                )}

                {/* ── STEP: SUCCESS ── */}
                {step === STEPS.SUCCESS && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-5 py-16 px-10 fade-up">
                        <div className="w-16 h-16 bg-zinc-900 dark:bg-zinc-100 rounded-full flex items-center justify-center text-white dark:text-zinc-900">
                            <CheckIcon />
                        </div>
                        <div className="text-center space-y-1">
                            <p className="text-base font-bold text-zinc-800 dark:text-zinc-100">Post shared!</p>
                            <p className="text-sm text-zinc-400">Your post is now live.</p>
                        </div>
                        <button
                            onClick={reset}
                            className="mt-2 px-6 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-bold rounded-xl hover:opacity-80 active:scale-95 transition-all"
                        >
                            Create another
                        </button>
                    </div>
                )}
            </div>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                onChange={e => { if (e.target.files) { addFiles(e.target.files); e.target.value = '' } }}
            />
        </div>
    )
}
