"use client"

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../providers/AuthProvider";

export default function UserLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { authState } = useAuth();

    useEffect(() => {
        // redirect when auth is confirmed as unauthenticated
        if (authState === "unauthenticated") {
            router.replace("/login");
        }
    }, [authState, router]);

    return (
        <div className="flex min-h-screen bg-white dark:bg-[#020203] overflow-hidden text-zinc-900 dark:text-zinc-100">
            <Sidebar />
            
            <main className="flex-1 h-screen overflow-y-auto relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={pathname}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ 
                            duration: 0.4, 
                            ease: [0.25, 0.1, 0.25, 1] // Smooth Quartic easing
                        }}
                        className="w-full h-full"
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}