'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface Particle {
  x: number; y: number; vx: number; vy: number; life: number; type: 'spark' | 'aura';
}

export default function ZynonFinalPage() {
  const router = useRouter()
  const [isDrawn, setIsDrawn] = useState(false)
  const [isStriking, setIsStriking] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const leftPanelRef = useRef<HTMLDivElement>(null)
  const rightPanelRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef({ x: 0, y: 0, vx: 0, vy: 0 })
  const trailPoints = useRef<{ x: number; y: number; age: number }[]>([])
  const particles = useRef<Particle[]>([])

  const playThud = () => {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(60, ctx.currentTime) 
    osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
    gain.gain.setValueAtTime(0.4, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
    osc.connect(gain); gain.connect(ctx.destination)
    osc.start(); osc.stop(ctx.currentTime + 0.5)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrame: number

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.vx = e.clientX - mouseRef.current.x
      mouseRef.current.vy = e.clientY - mouseRef.current.y
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
      trailPoints.current.push({ x: e.clientX, y: e.clientY, age: 0 })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const { x, y } = mouseRef.current

      // Soft Glow following mouse (Android 16 Aura)
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 150);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // DRAW PARTICLES
      particles.current.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.life -= 0.01
        ctx.fillStyle = `rgba(255, 255, 255, ${p.life * (p.type === 'aura' ? 0.15 : 0.8)})`
        ctx.beginPath(); 
        ctx.arc(p.x, p.y, p.type === 'aura' ? Math.random() * 3 : 1, 0, Math.PI * 2); 
        ctx.fill()
      })
      particles.current = particles.current.filter(p => p.life > 0)
      animationFrame = requestAnimationFrame(animate)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)
    handleResize(); animate()
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationFrame)
    }
  }, [isHovering, isDrawn])

  const handleStrike = (e: React.MouseEvent) => {
    playThud()
    for (let i = 0; i < 50; i++) {
      particles.current.push({
        x: e.clientX, y: e.clientY,
        vx: (Math.random() - 0.5) * 20, vy: (Math.random() - 0.5) * 20,
        life: 1.0, type: 'spark'
      })
    }
    setIsStriking(true)
    setTimeout(() => {
      setIsStriking(false)
      setIsDrawn(true)
      setTimeout(() => router.push('/signup'), 1200)
    }, 150)
  }

  return (
    <main className="relative min-h-screen bg-[#050505] text-white overflow-hidden cursor-crosshair selection:bg-white/30" 
          style={{ fontFamily: 'Inter, -apple-system, system-ui, sans-serif' }}>
      
      {/* BACKGROUND MESH */}
      <div className="fixed inset-0 opacity-40 pointer-events-none" 
           style={{ background: 'radial-gradient(circle at 50% 50%, #1a1a2e 0%, #050505 100%)' }} />

      {/* IMPACT FLASH */}
      <div className={`fixed inset-0 z-[120] bg-white transition-opacity duration-300 pointer-events-none ${isStriking ? 'opacity-30' : 'opacity-0'}`} />

      {/* FX CANVAS */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[110]" />

      {/* GLASS SHEATH PANELS (Apple Refraction Style) */}
      <div className="absolute inset-0 z-20 flex pointer-events-none">
        <div ref={leftPanelRef} className={`flex-1 bg-white/[0.02] backdrop-blur-3xl border-r border-white/10 transition-transform duration-[1800ms] ease-[cubic-bezier(0.85,0,0.15,1)] ${isDrawn ? '-translate-x-full' : 'translate-x-0'}`} />
        <div ref={rightPanelRef} className={`flex-1 bg-white/[0.02] backdrop-blur-3xl border-l border-white/10 transition-transform duration-[1800ms] ease-[cubic-bezier(0.85,0,0.15,1)] ${isDrawn ? 'translate-x-full' : 'translate-x-0'}`} />
      </div>

      {/* MAIN INTERFACE */}
      <section className={`relative z-30 h-screen flex flex-col items-center justify-center px-6 transition-all duration-1000 ${isDrawn ? 'opacity-0 scale-95 blur-xl' : 'opacity-100'}`}>
        
        <h1 className="text-7xl md:text-[12rem] font-bold tracking-tighter mb-20 select-none bg-gradient-to-b from-white via-white to-white/20 bg-clip-text text-transparent">
          Zynon
        </h1>

        <button 
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onClick={handleStrike}
          className="group relative px-20 py-6 rounded-full bg-white text-black transition-all duration-500 hover:scale-105 active:scale-95 overflow-hidden"
          style={{ boxShadow: isHovering ? '0 0 40px rgba(255,255,255,0.3)' : '0 0 20px rgba(255,255,255,0.1)' }}
        >
          <span className="relative z-10 text-xs tracking-[1.2em] uppercase font-bold ml-[1.2em]">
            {isHovering ? "Enter Void" : "Continue"}
          </span>
          {/* Liquid Shimmer Effect */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
        </button>

        <p className="mt-12 text-[10px] tracking-[0.8em] text-white/30 uppercase font-medium">
          Secure Terminal // 2026
        </p>
      </section>

      {/* REVEAL CONTENT (Background layer) */}
      <div className={`absolute inset-0 z-0 flex flex-col items-center justify-center transition-opacity duration-1000 ${isDrawn ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-24 h-24 border border-white/20 rounded-full animate-ping absolute" />
        <span className="text-xs tracking-[2em] uppercase text-white/50 animate-pulse">Initializing</span>
      </div>

      <style jsx global>{`
        @keyframes shimmer { 100% { transform: translateX(100%); } }
        .animate-shimmer { animation: shimmer 1.5s infinite; }
        body { background-color: #050505; margin: 0; user-select: none; }
      `}</style>
    </main>
  )
}