'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { gsap } from '@/lib/gsap'
import { Button } from '@/components/ui/button'
import styles from '@/styles/sections/VideoIntro.module.css'

// Three.js canvas — client-only (no SSR)
const ParticleField = dynamic(() => import('@/components/three/ParticleField'), { ssr: false })

export default function VideoIntro({ heroRef }) {
  const videoRef   = useRef(null)
  const [muted, setMuted] = useState(true)

  const greetRef  = useRef(null)
  const nameRef   = useRef(null)
  const roleRef   = useRef(null)
  const scrollRef = useRef(null)

  // Entrance animation on mount
  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.4 })
    tl.fromTo(greetRef.current,  { opacity: 0, y: -18 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })
      .fromTo(nameRef.current,   { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out' }, '-=0.2')
      .fromTo(roleRef.current,   { opacity: 0, y:  20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4')
      .fromTo(scrollRef.current, { opacity: 0         }, { opacity: 1,        duration: 0.5              }, '-=0.1')
    return () => tl.kill()
  }, [])

  // Video fade-in
  useEffect(() => {
    if (!videoRef.current) return
    const t = gsap.fromTo(videoRef.current, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power2.out' })
    return () => t.kill()
  }, [])

  function handleEnded() {
    heroRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  function scrollToHero() {
    heroRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className={styles.section}>

      {/* 1 — Blurred ambient background */}
      <video
        src="/assets/about-me.mp4"
        autoPlay muted playsInline
        aria-hidden="true"
        className={styles.bgVideo}
      />

      {/* 2 — Main video (cover crop, cinematic) */}
      <video
        ref={videoRef}
        data-testid="intro-video"
        src="/assets/about-me.mp4"
        autoPlay muted={muted} playsInline
        onEnded={handleEnded}
        className={styles.mainVideo}
      />

      {/* 3 — Dark gradient overlay */}
      <div className={styles.overlay} />

      {/* 4 — Three.js particle field */}
      <ParticleField />

      {/* 5 — Landing text content */}
      <div className={styles.heroContent}>
        <p ref={greetRef} className={styles.eyebrow}>Portfolio 2025</p>

        <h1 ref={nameRef} className={styles.name}>
          Vaibhav<br />Khushalani
        </h1>

        <p ref={roleRef} className={styles.role}>
          Full-Stack Engineer &nbsp;·&nbsp; AI Systems &nbsp;·&nbsp; System Design
        </p>
      </div>

      {/* 6 — Scroll cue (bottom centre) */}
      <button ref={scrollRef} className={styles.scrollCue} onClick={scrollToHero} aria-label="Scroll to next section">
        <span className={styles.scrollLabel}>Scroll</span>
        <span className={styles.scrollLine} />
      </button>

      {/* 7 — Mute toggle */}
      <Button
        variant="ghost"
        onClick={() => setMuted(m => !m)}
        className={`${styles.muteBtn} rounded-full text-xs font-semibold tracking-widest uppercase px-4 h-9`}
      >
        {muted ? '🔇  Sound off' : '🔊  Sound on'}
      </Button>
    </section>
  )
}
