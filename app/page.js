'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import Navbar                from '@/components/ui/Navbar'
import VideoIntro            from '@/components/sections/VideoIntro'
import HeroSection           from '@/components/sections/HeroSection'
import AboutSection          from '@/components/sections/AboutSection'
import WorkExperienceSection from '@/components/sections/WorkExperienceSection'
import profile               from '@/data/profile.json'

// Snap: 0=video, 1=hero, 2=about. Work exp (3-5) uses free scroll.
const WORK_SLIDES   = profile.experience.length       // 3
const TOTAL         = 3 + WORK_SLIDES                 // 6
const WORK_FIRST    = 3
const WORK_LAST     = TOTAL - 1                       // 5

export default function Home() {
  const mainRef  = useRef(null)
  const idxRef   = useRef(0)
  const busyRef  = useRef(false)
  const tweenRef = useRef(null)

  useEffect(() => {
    const el = mainRef.current
    if (!el) return

    function goTo(idx) {
      idx = Math.max(0, Math.min(TOTAL - 1, idx))
      if (idx === idxRef.current || busyRef.current) return
      idxRef.current = idx
      busyRef.current = true
      tweenRef.current?.kill()
      // GSAP tween for butter-smooth scroll (better than browser smooth)
      tweenRef.current = gsap.to(el, {
        scrollTop: idx * window.innerHeight,
        duration: 1.0,
        ease: 'power3.inOut',
        onComplete: () => { busyRef.current = false },
      })
    }

    function onWheel(e) {
      e.preventDefault()
      const idx = idxRef.current
      const goingDown = e.deltaY > 0

      if (idx >= WORK_FIRST && idx <= WORK_LAST) {
        // At work-exp start scrolling up → snap back to About
        if (!goingDown && el.scrollTop <= WORK_FIRST * window.innerHeight + 50) {
          if (!busyRef.current) goTo(WORK_FIRST - 1)
          return
        }
        // Free scroll: wheel delta drives ScrollTrigger directly
        el.scrollTop = Math.max(
          WORK_FIRST * window.innerHeight,
          Math.min(WORK_LAST * window.innerHeight, el.scrollTop + e.deltaY)
        )
        return
      }

      if (busyRef.current) return
      goTo(idx + (goingDown ? 1 : -1))
    }

    let touchY = 0
    function onTouchStart(e) { touchY = e.touches[0].clientY }
    function onTouchEnd(e) {
      const idx = idxRef.current
      const dy = touchY - e.changedTouches[0].clientY
      if (Math.abs(dy) < 40) return

      if (idx >= WORK_FIRST && idx <= WORK_LAST) {
        if (dy < 0 && el.scrollTop <= WORK_FIRST * window.innerHeight + 50) {
          if (!busyRef.current) goTo(WORK_FIRST - 1)
          return
        }
        el.scrollTop = Math.max(
          WORK_FIRST * window.innerHeight,
          Math.min(WORK_LAST * window.innerHeight, el.scrollTop + dy * 3)
        )
        return
      }

      if (busyRef.current) return
      goTo(idx + (dy > 0 ? 1 : -1))
    }

    function onScroll() {
      idxRef.current = Math.round(el.scrollTop / window.innerHeight)
    }

    el.addEventListener('wheel',      onWheel,      { passive: false })
    el.addEventListener('touchstart', onTouchStart, { passive: true  })
    el.addEventListener('touchend',   onTouchEnd,   { passive: true  })
    el.addEventListener('scroll',     onScroll,     { passive: true  })

    return () => {
      el.removeEventListener('wheel',      onWheel)
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchend',   onTouchEnd)
      el.removeEventListener('scroll',     onScroll)
      tweenRef.current?.kill()
    }
  }, [])

  return (
    <>
      <Navbar />
      <main ref={mainRef} style={{ height: '100vh', overflowY: 'scroll' }}>
        <div>
          <VideoIntro />
          <HeroSection />
          <AboutSection />
          <WorkExperienceSection />
        </div>
      </main>
    </>
  )
}
