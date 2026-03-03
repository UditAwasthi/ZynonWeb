'use client'

import React from 'react'

export default function NotificationsPage() {
    const activity = [
        { id: 1, type: 'like', user: 'arch_daily', time: '2h', img: 'https://i.pravatar.cc/150?u=1', post: 'https://images.unsplash.com/photo-1449156059431-787c1be1f62b?w=100' },
        { id: 2, type: 'follow', user: 'minimalist_vibes', time: '5h', img: 'https://i.pravatar.cc/150?u=2', isFollowing: false },
        { id: 3, type: 'comment', user: 'design_mind', time: '1d', img: 'https://i.pravatar.cc/150?u=3', text: 'Stunning use of contrast!', post: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100' },
    ]

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex justify-center py-8 px-4">
            <div className="max-w-[600px] w-full flex flex-col gap-8">
                <h1 className="text-2xl font-bold px-2">Notifications</h1>

                <section className="space-y-6">
                    <h2 className="text-sm font-bold px-2 text-zinc-500">This Week</h2>
                    <div className="space-y-2">
                        {activity.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 rounded-xl transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0">
                                        <img src={item.img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="user" />
                                    </div>
                                    <div className="text-sm leading-tight">
                                        <span className="font-bold mr-1">{item.user}</span>
                                        <span className="text-zinc-500 dark:text-zinc-400">
                                            {item.type === 'like' && 'liked your photo.'}
                                            {item.type === 'follow' && 'started following you.'}
                                            {item.type === 'comment' && `commented: ${item.text}`}
                                        </span>
                                        <span className="ml-2 text-zinc-400 text-xs">{item.time}</span>
                                    </div>
                                </div>

                                {item.post ? (
                                    <div className="w-11 h-11 rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-900 flex-shrink-0 border border-zinc-200 dark:border-zinc-800">
                                        <img src={item.post} className="w-full h-full object-cover grayscale" alt="post thumbnail" />
                                    </div>
                                ) : (
                                    <button className="text-xs font-bold px-4 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg">
                                        Follow
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}