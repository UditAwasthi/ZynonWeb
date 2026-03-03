export default function HomePage() {
    return (
        <div className="flex min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
            {/* 1. MAIN FEED AREA */}
            <main className="flex-1 flex justify-center py-8 px-4">
                <div className="max-w-[630px] w-full flex flex-col gap-8">

                    {/* STORIES BAR */}
                    <section className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide border-b border-zinc-100 dark:border-zinc-900">
                        {[...Array(7)].map((_, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0 group cursor-pointer">
                                <div className="w-16 h-16 rounded-full p-[2px] ring-2 ring-zinc-200 dark:ring-zinc-800 group-hover:ring-zinc-400 transition-all">
                                    <div className="w-full h-full rounded-full bg-zinc-100 dark:bg-zinc-900 border-2 border-white dark:border-zinc-950 overflow-hidden">
                                        <img
                                            src={`https://i.pravatar.cc/150?u=user${i}`}
                                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                            alt="story"
                                        />
                                    </div>
                                </div>
                                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">user_id_{i}</span>
                            </div>
                        ))}
                    </section>

                    {/* MAIN FEED */}
                    <div className="flex flex-col gap-12">
                        {[1, 2, 3].map((post) => (
                            <article key={post} className="pb-8 border-b border-zinc-100 dark:border-zinc-900 last:border-0">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800">
                                            <img src={`https://i.pravatar.cc/150?u=avatar${post}`} className="grayscale" alt="user" />
                                        </div>
                                        <span className="text-sm font-bold tracking-tight">studio_monochrome</span>
                                        <span className="text-zinc-400">• 4h</span>
                                    </div>
                                </div>

                                <div className="aspect-square rounded-lg overflow-hidden bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-900 group">
                                    <img
                                        src={`https://images.unsplash.com/photo-${1600000000000 + (post * 500)}?auto=format&fit=crop&w=1000&q=80`}
                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
                                        alt="Post"
                                    />
                                </div>

                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center gap-4">
                                        <HeartIcon />
                                        <CommentIcon />
                                        <ShareIcon />
                                    </div>
                                    <BookmarkIcon />
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </main>

            {/* 2. RIGHT SUGGESTIONS (Desktop Only) */}
            <aside className="hidden lg:block w-[350px] py-12 pr-8 pl-4">
                <div className="space-y-4">
                    <p className="text-sm font-bold text-zinc-500">Suggested for you</p>
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                                    <img src={`https://i.pravatar.cc/150?u=s${s}`} className="grayscale group-hover:grayscale-0 transition-all" alt="suggested" />
                                </div>
                                <p className="text-xs font-bold">minimal_user_{s}</p>
                            </div>
                            <button className="text-xs font-bold hover:opacity-50">Follow</button>
                        </div>
                    ))}
                </div>
            </aside>
        </div>
    )
}

/* --- ICON COMPONENTS --- */
const HeartIcon = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
const CommentIcon = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.7 8.38 8.38 0 0 1 3.8.9L21 3z" /></svg>
const ShareIcon = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
const BookmarkIcon = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>