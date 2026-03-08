'use client'

import React, { useState, useRef, useCallback } from 'react'
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://zynon.onrender.com/api/content'

export default function CreatePage() {

    const router = useRouter()

    const [files, setFiles] = useState<any[]>([])
    const [caption, setCaption] = useState("")
    const [visibility, setVisibility] = useState("public")
    const [loading, setLoading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({})
    const [isDragging, setIsDragging] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)

    /* FILE HANDLING */

    const addFiles = useCallback((incoming: FileList) => {
        const valid = Array.from(incoming).filter(f => {
            if (!f.type.startsWith("image/") && !f.type.startsWith("video/")) return false
            if (f.size > 20 * 1024 * 1024) {
                toast.error(`${f.name} exceeds 20MB`)
                return false
            }
            return true
        })

        setFiles(prev => [
            ...prev,
            ...valid.map(f => ({
                file: f,
                preview: URL.createObjectURL(f),
                type: f.type.startsWith("image/") ? "image" : "video"
            }))
        ])
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files) addFiles(e.dataTransfer.files)
    }, [addFiles])

    const removeFile = (index: number) => {
        setFiles(prev => {
            URL.revokeObjectURL(prev[index].preview)
            return prev.filter((_, i) => i !== index)
        })
        if (selectedIndex === index) setSelectedIndex(null)
    }

    /* CLOUDINARY UPLOAD */

    const uploadToCloudinary = async (file: File, index: number) => {
        const token = localStorage.getItem("accessToken")

        const sigRes = await fetch(`${API_BASE}/media/signature`, {
            headers: { Authorization: `Bearer ${token}` }
        })

        const sig = await sigRes.json()
        const formData = new FormData()

        formData.append("file", file)
        formData.append("api_key", sig.apiKey)
        formData.append("timestamp", sig.timestamp)
        formData.append("signature", sig.signature)
        formData.append("folder", "zynon/posts")

        return new Promise<any>((resolve, reject) => {
            const xhr = new XMLHttpRequest()

            xhr.upload.addEventListener("progress", (e) => {
                if (!e.lengthComputable) return
                const percent = Math.round((e.loaded * 100) / e.total)
                setUploadProgress(prev => ({ ...prev, [index]: percent }))
            })

            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    const data = JSON.parse(xhr.responseText)
                    if (xhr.status === 200) resolve(data)
                    else reject(data)
                }
            }

            xhr.open("POST", `https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`)
            xhr.send(formData)
        })
    }

    /* SUBMIT */

    const handleSubmit = async () => {
        if (!files.length) return

        setLoading(true)
        toast.loading("Uploading post...", { id: "upload" })

        try {
            const uploads = files.map((f, i) => uploadToCloudinary(f.file, i))
            const results = await Promise.all(uploads)

            const media = results.map(r => ({
                url: r.secure_url,
                publicId: r.public_id,
                width: r.width,
                height: r.height,
                duration: r.duration || null,
                type: r.resource_type === "video" ? "video" : "image"
            }))

            const token = localStorage.getItem("accessToken")

            const res = await fetch(`${API_BASE}/posts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ caption, visibility, media })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.message)

            toast.success("Post uploaded successfully!", { id: "upload" })
            router.push("/profile")

        } catch (err: any) {
            toast.error(err.message || "Upload failed", { id: "upload" })
        } finally {
            setLoading(false)
        }
    }

    /* RESET */

    const reset = () => {
        files.forEach(f => URL.revokeObjectURL(f.preview))
        setFiles([])
        setCaption("")
        setVisibility("public")
        setUploadProgress({})
        setSelectedIndex(null)
    }

    const mainPreview = selectedIndex !== null ? files[selectedIndex] : files[0]

    /* UI */

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=SF+Pro+Display:wght@300;400;500;600&display=swap');

                * { box-sizing: border-box; margin: 0; padding: 0; }

                :root {
                    --bg: #f2f2f7;
                    --surface: rgba(255,255,255,0.72);
                    --surface-solid: #ffffff;
                    --border: rgba(0,0,0,0.08);
                    --border-strong: rgba(0,0,0,0.14);
                    --text-primary: #1c1c1e;
                    --text-secondary: #6e6e73;
                    --text-tertiary: #aeaeb2;
                    --accent: #0071e3;
                    --accent-hover: #0077ed;
                    --accent-light: rgba(0,113,227,0.10);
                    --danger: #ff3b30;
                    --success: #34c759;
                    --radius-sm: 10px;
                    --radius-md: 16px;
                    --radius-lg: 20px;
                    --radius-xl: 28px;
                    --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
                    --shadow-md: 0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04);
                    --shadow-lg: 0 12px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06);
                    --font: -apple-system, 'SF Pro Display', BlinkMacSystemFont, system-ui, sans-serif;
                    --transition: cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }

                body {
                    font-family: var(--font);
                    background: var(--bg);
                    color: var(--text-primary);
                    -webkit-font-smoothing: antialiased;
                }

                .page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px 16px;
                    background: var(--bg);
                }

                .card {
                    width: 100%;
                    max-width: 520px;
                    background: var(--surface-solid);
                    border-radius: var(--radius-xl);
                    box-shadow: var(--shadow-lg);
                    overflow: hidden;
                    animation: slideUp 0.5s var(--transition) both;
                }

                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                /* HEADER */
                .header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 18px 20px 0;
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .btn-ghost {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: var(--text-secondary);
                    font-size: 15px;
                    font-family: var(--font);
                    padding: 4px 0;
                    transition: color 0.15s;
                    -webkit-font-smoothing: antialiased;
                }

                .btn-ghost:hover { color: var(--text-primary); }

                .header-title {
                    font-size: 17px;
                    font-weight: 600;
                    letter-spacing: -0.3px;
                    color: var(--text-primary);
                }

                .btn-share {
                    background: var(--accent);
                    color: #fff;
                    border: none;
                    border-radius: 20px;
                    padding: 7px 18px;
                    font-size: 15px;
                    font-weight: 600;
                    font-family: var(--font);
                    cursor: pointer;
                    transition: background 0.15s, transform 0.1s, opacity 0.15s;
                    -webkit-font-smoothing: antialiased;
                    letter-spacing: -0.2px;
                }

                .btn-share:hover:not(:disabled) { background: var(--accent-hover); transform: scale(1.02); }
                .btn-share:active:not(:disabled) { transform: scale(0.98); }
                .btn-share:disabled { opacity: 0.5; cursor: not-allowed; }

                .divider {
                    height: 1px;
                    background: var(--border);
                    margin: 16px 0 0;
                }

                /* BODY */
                .body { padding: 20px; display: flex; flex-direction: column; gap: 20px; }

                /* DROP ZONE */
                .drop-zone {
                    border-radius: var(--radius-lg);
                    border: 1.5px dashed var(--border-strong);
                    background: var(--bg);
                    aspect-ratio: 1 / 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: border-color 0.2s, background 0.2s, transform 0.15s var(--transition);
                    position: relative;
                    overflow: hidden;
                }

                .drop-zone:hover {
                    border-color: var(--accent);
                    background: var(--accent-light);
                    transform: scale(1.005);
                }

                .drop-zone.dragging {
                    border-color: var(--accent);
                    background: var(--accent-light);
                    transform: scale(1.01);
                }

                .drop-zone.has-files {
                    border: none;
                    background: #000;
                    cursor: default;
                }

                .drop-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background: var(--surface-solid);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 12px;
                    box-shadow: var(--shadow-sm);
                }

                .drop-icon svg { width: 22px; height: 22px; color: var(--accent); }

                .drop-label {
                    font-size: 15px;
                    font-weight: 500;
                    color: var(--text-primary);
                    margin-bottom: 4px;
                    letter-spacing: -0.2px;
                }

                .drop-sub {
                    font-size: 13px;
                    color: var(--text-tertiary);
                    letter-spacing: -0.1px;
                }

                .preview-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                }

                .preview-video {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                }

                .preview-overlay {
                    position: absolute;
                    bottom: 12px;
                    right: 12px;
                    display: flex;
                    gap: 8px;
                }

                .overlay-btn {
                    background: rgba(0,0,0,0.5);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: none;
                    border-radius: 20px;
                    padding: 6px 12px;
                    color: #fff;
                    font-size: 13px;
                    font-family: var(--font);
                    font-weight: 500;
                    cursor: pointer;
                    transition: background 0.15s;
                    letter-spacing: -0.1px;
                }

                .overlay-btn:hover { background: rgba(0,0,0,0.7); }

                /* FILMSTRIP */
                .filmstrip {
                    display: flex;
                    gap: 8px;
                    overflow-x: auto;
                    padding-bottom: 2px;
                    scrollbar-width: none;
                }

                .filmstrip::-webkit-scrollbar { display: none; }

                .thumb-wrap {
                    flex-shrink: 0;
                    position: relative;
                    width: 72px;
                    height: 72px;
                    border-radius: var(--radius-sm);
                    overflow: hidden;
                    cursor: pointer;
                    transition: transform 0.15s var(--transition);
                }

                .thumb-wrap:hover { transform: scale(1.04); }

                .thumb-wrap.selected {
                    outline: 2.5px solid var(--accent);
                    outline-offset: 2px;
                }

                .thumb-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                }

                .thumb-remove {
                    position: absolute;
                    top: 4px;
                    right: 4px;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: rgba(0,0,0,0.55);
                    backdrop-filter: blur(8px);
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    opacity: 0;
                    transition: opacity 0.15s;
                }

                .thumb-wrap:hover .thumb-remove { opacity: 1; }

                .thumb-add {
                    flex-shrink: 0;
                    width: 72px;
                    height: 72px;
                    border-radius: var(--radius-sm);
                    border: 1.5px dashed var(--border-strong);
                    background: var(--bg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: border-color 0.15s, background 0.15s;
                }

                .thumb-add:hover {
                    border-color: var(--accent);
                    background: var(--accent-light);
                }

                .thumb-add svg { width: 18px; height: 18px; color: var(--text-tertiary); }
                .thumb-add:hover svg { color: var(--accent); }

                /* CAPTION */
                .caption-wrap {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .section-label {
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.6px;
                    color: var(--text-tertiary);
                }

                .caption-input {
                    width: 100%;
                    min-height: 90px;
                    resize: none;
                    border: 1.5px solid var(--border);
                    border-radius: var(--radius-md);
                    padding: 13px 14px;
                    font-size: 15px;
                    font-family: var(--font);
                    color: var(--text-primary);
                    background: var(--bg);
                    outline: none;
                    line-height: 1.5;
                    letter-spacing: -0.2px;
                    transition: border-color 0.2s, box-shadow 0.2s;
                    -webkit-font-smoothing: antialiased;
                }

                .caption-input::placeholder { color: var(--text-tertiary); }

                .caption-input:focus {
                    border-color: var(--accent);
                    box-shadow: 0 0 0 3px var(--accent-light);
                    background: var(--surface-solid);
                }

                /* VISIBILITY */
                .vis-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px;
                    background: var(--bg);
                    border-radius: var(--radius-md);
                }

                .vis-label {
                    font-size: 15px;
                    font-weight: 500;
                    letter-spacing: -0.2px;
                    color: var(--text-primary);
                }

                .vis-select {
                    background: none;
                    border: none;
                    font-size: 15px;
                    font-family: var(--font);
                    color: var(--accent);
                    font-weight: 500;
                    cursor: pointer;
                    outline: none;
                    letter-spacing: -0.2px;
                    -webkit-font-smoothing: antialiased;
                }

                /* FOOTER */
                .footer {
                    padding: 0 20px 20px;
                }

                .btn-primary {
                    width: 100%;
                    background: var(--accent);
                    color: #fff;
                    border: none;
                    border-radius: var(--radius-md);
                    padding: 15px;
                    font-size: 17px;
                    font-weight: 600;
                    font-family: var(--font);
                    cursor: pointer;
                    transition: background 0.15s, transform 0.1s, opacity 0.15s;
                    letter-spacing: -0.3px;
                    -webkit-font-smoothing: antialiased;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }

                .btn-primary:hover:not(:disabled) { background: var(--accent-hover); transform: scale(1.005); }
                .btn-primary:active:not(:disabled) { transform: scale(0.995); }
                .btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }

                .spinner {
                    width: 18px;
                    height: 18px;
                    border: 2.5px solid rgba(255,255,255,0.4);
                    border-top-color: #fff;
                    border-radius: 50%;
                    animation: spin 0.7s linear infinite;
                }

                @keyframes spin { to { transform: rotate(360deg); } }

                /* PROGRESS PANEL */
                .progress-panel {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    width: 300px;
                    background: rgba(255,255,255,0.9);
                    backdrop-filter: blur(20px) saturate(1.8);
                    -webkit-backdrop-filter: blur(20px) saturate(1.8);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-lg);
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    animation: panelIn 0.3s var(--transition) both;
                }

                @keyframes panelIn {
                    from { opacity: 0; transform: translateY(12px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }

                .panel-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .panel-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: var(--accent);
                    animation: pulse 1.2s ease-in-out infinite;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(0.85); }
                }

                .panel-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text-primary);
                    letter-spacing: -0.2px;
                }

                .progress-item { display: flex; flex-direction: column; gap: 5px; }

                .progress-meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .progress-name {
                    font-size: 12px;
                    color: var(--text-secondary);
                    max-width: 200px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    letter-spacing: -0.1px;
                }

                .progress-pct {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--accent);
                    letter-spacing: -0.1px;
                }

                .progress-track {
                    height: 3px;
                    border-radius: 99px;
                    background: var(--border);
                    overflow: hidden;
                }

                .progress-fill {
                    height: 100%;
                    border-radius: 99px;
                    background: var(--accent);
                    transition: width 0.2s ease;
                }

                @media (prefers-color-scheme: dark) {
                    :root {
                        --bg: #1c1c1e;
                        --surface-solid: #2c2c2e;
                        --border: rgba(255,255,255,0.10);
                        --border-strong: rgba(255,255,255,0.16);
                        --text-primary: #f5f5f7;
                        --text-secondary: #98989d;
                        --text-tertiary: #636366;
                        --accent-light: rgba(10,132,255,0.16);
                        --accent: #0a84ff;
                        --accent-hover: #1d8fff;
                        --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
                        --shadow-md: 0 4px 20px rgba(0,0,0,0.4);
                        --shadow-lg: 0 12px 40px rgba(0,0,0,0.5);
                    }

                    .progress-panel {
                        background: rgba(44,44,46,0.95);
                    }
                }
            `}</style>

            <div className="page">
                <div className="card">

                    {/* HEADER */}
                    <div className="header">
                        <div className="header-left">
                            <button className="btn-ghost" onClick={reset}>Cancel</button>
                        </div>
                        <span className="header-title">New Post</span>
                        <button
                            className="btn-share"
                            onClick={handleSubmit}
                            disabled={loading || !files.length}
                        >
                            Share
                        </button>
                    </div>
                    <div className="divider" />

                    <div className="body">

                        {/* DROP / PREVIEW ZONE */}
                        <div
                            className={`drop-zone ${isDragging ? "dragging" : ""} ${files.length > 0 ? "has-files" : ""}`}
                            onClick={() => !files.length && fileInputRef.current?.click()}
                            onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                        >
                            {files.length === 0 ? (
                                <>
                                    <div className="drop-icon">
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                        </svg>
                                    </div>
                                    <p className="drop-label">Drop photos & videos</p>
                                    <p className="drop-sub">or click to browse · up to 20MB each</p>
                                </>
                            ) : mainPreview ? (
                                <>
                                    {mainPreview.type === "image" ? (
                                        <img src={mainPreview.preview} className="preview-img" alt="" />
                                    ) : (
                                        <video src={mainPreview.preview} className="preview-video" autoPlay muted loop playsInline />
                                    )}
                                    <div className="preview-overlay">
                                        <button
                                            className="overlay-btn"
                                            onClick={e => { e.stopPropagation(); fileInputRef.current?.click() }}
                                        >
                                            + Add more
                                        </button>
                                    </div>
                                </>
                            ) : null}
                        </div>

                        {/* FILMSTRIP */}
                        {files.length > 0 && (
                            <div className="filmstrip">
                                {files.map((f, i) => (
                                    <div
                                        key={i}
                                        className={`thumb-wrap ${(selectedIndex ?? 0) === i ? "selected" : ""}`}
                                        onClick={() => setSelectedIndex(i)}
                                    >
                                        <img src={f.preview} className="thumb-img" alt="" />
                                        <button
                                            className="thumb-remove"
                                            onClick={e => { e.stopPropagation(); removeFile(i) }}
                                        >
                                            <svg width="10" height="10" fill="none" viewBox="0 0 10 10">
                                                <path d="M1 1l8 8M9 1L1 9" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}

                                <div className="thumb-add" onClick={() => fileInputRef.current?.click()}>
                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                </div>
                            </div>
                        )}

                        {/* CAPTION */}
                        <div className="caption-wrap">
                            <span className="section-label">Caption</span>
                            <textarea
                                className="caption-input"
                                placeholder="Write a caption…"
                                value={caption}
                                onChange={e => setCaption(e.target.value)}
                            />
                        </div>

                        {/* VISIBILITY */}
                        <div className="vis-row">
                            <span className="vis-label">Audience</span>
                            <select
                                className="vis-select"
                                value={visibility}
                                onChange={e => setVisibility(e.target.value)}
                            >
                                <option value="public">Everyone</option>
                                <option value="followers">Followers</option>
                                <option value="private">Only Me</option>
                            </select>
                        </div>

                    </div>

                    {/* FOOTER SHARE BUTTON */}
                    <div className="footer">
                        <button
                            className="btn-primary"
                            onClick={handleSubmit}
                            disabled={loading || !files.length}
                        >
                            {loading ? (
                                <>
                                    <div className="spinner" />
                                    Uploading…
                                </>
                            ) : "Share Post"}
                        </button>
                    </div>

                </div>
            </div>

            {/* HIDDEN FILE INPUT */}
            <input
                type="file"
                multiple
                accept="image/*,video/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={e => {
                    if (e.target.files) {
                        addFiles(e.target.files)
                        e.target.value = ""
                    }
                }}
            />

            {/* UPLOAD PROGRESS PANEL */}
            {loading && (
                <div className="progress-panel">
                    <div className="panel-header">
                        <div className="panel-dot" />
                        <span className="panel-title">Uploading {files.length} {files.length === 1 ? "file" : "files"}</span>
                    </div>
                    {files.map((f, i) => (
                        <div key={i} className="progress-item">
                            <div className="progress-meta">
                                <span className="progress-name">{f.file.name}</span>
                                <span className="progress-pct">{uploadProgress[i] || 0}%</span>
                            </div>
                            <div className="progress-track">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${uploadProgress[i] || 0}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    )
}