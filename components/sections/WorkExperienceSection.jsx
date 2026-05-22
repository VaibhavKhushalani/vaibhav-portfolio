'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import WorkExpParticles from '@/components/three/WorkExpParticles'
import profile from '@/data/profile.json'
import styles from '@/styles/sections/WorkExperienceSection.module.css'

const EXPS   = profile.experience
const IMAGES = [
  '/assets/work-experience.png',
  '/assets/work-experience-2.png',
  '/assets/work-experience-3.png',
]

export default function WorkExperienceSection() {
  const sectionRef  = useRef(null)
  const trackRef    = useRef(null)
  const contentRefs = useRef([])
  const bgRefs      = useRef([])
  const counterRef  = useRef(null)
  const progressRef = useRef(null)
  const dotRefs     = useRef([])
  const [slideIdx, setSlideIdx] = useState(0)

  useEffect(() => {
    const section = sectionRef.current
    const track   = trackRef.current
    if (!section || !track) return

    const scroller = document.querySelector('main')
    if (!scroller) return
    const n = EXPS.length
    contentRefs.current = contentRefs.current.slice(0, n)
    bgRefs.current = bgRefs.current.slice(0, n)

    // Initial state for slides 2+
    contentRefs.current.forEach((el, i) => {
      if (el && i > 0) gsap.set(el, { opacity: 0, y: 30 })
    })

    const tl = gsap.timeline()

    // Horizontal track slide — ease:none for 1:1 scrub feel
    tl.to(track, {
      x: () => -(n - 1) * window.innerWidth,
      ease: 'none',
      duration: n - 1,
    }, 0)

    for (let i = 0; i < n - 1; i++) {
      const curr   = contentRefs.current[i]
      const next   = contentRefs.current[i + 1]
      const nextBg = bgRefs.current[i + 1]

      // Exit: blur + fade current slide content
      if (curr) {
        tl.to(curr, {
          opacity: 0, y: -40, filter: 'blur(6px)',
          duration: 0.2, ease: 'power2.in',
        }, i + 0.30)
      }

      // Background image scale on entry
      if (nextBg) {
        tl.fromTo(nextBg,
          { scale: 1.04 },
          { scale: 1.0, duration: 1.0, ease: 'power2.out' },
          i
        )
      }

      if (next) {
        // Restore parent visibility before child animations (parent was set to opacity:0)
        tl.set(next, { opacity: 1, y: 0 }, i + 0.44)

        const period  = next.querySelector(`.${styles.meta}`)
        const company = next.querySelector(`.${styles.company}`)
        const role    = next.querySelector(`.${styles.role}`)
        const bullets = next.querySelectorAll(`.${styles.bullet}`)
        const tags    = next.querySelectorAll(`.${styles.tag}`)

        // Period + type tag slide in from left
        if (period) {
          tl.fromTo(period,
            { x: -10, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.25, ease: 'power2.out' },
            i + 0.45
          )
        }

        // Company name clip-path reveal
        if (company) {
          tl.fromTo(company,
            { clipPath: 'inset(0 100% 0 0)', x: -8 },
            { clipPath: 'inset(0 0% 0 0)', x: 0, duration: 0.45, ease: 'expo.out' },
            i + 0.48
          )
        }

        // Role text fade up
        if (role) {
          tl.fromTo(role,
            { y: 15, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.30, ease: 'power2.out' },
            i + 0.56
          )
        }

        // Bullets stagger
        if (bullets.length) {
          tl.fromTo(bullets,
            { x: -15, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.35, ease: 'power2.out', stagger: 0.04 },
            i + 0.60
          )
        }

        // Tech tags stagger
        if (tags.length) {
          tl.fromTo(tags,
            { y: 6, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.25, ease: 'power2.out', stagger: 0.03 },
            i + 0.72
          )
        }
      }
    }

    const st = ScrollTrigger.create({
      animation: tl,
      trigger:   section,
      scroller,
      start:     'top top',
      end:       () => `+=${(n - 1) * window.innerHeight}`,
      scrub:     1,
      onUpdate: (self) => {
        const activeIdx = Math.round(self.progress * (n - 1))
        setSlideIdx(prev => prev !== activeIdx ? activeIdx : prev)

        if (progressRef.current) {
          gsap.set(progressRef.current, {
            scaleX: self.progress, transformOrigin: 'left center', overwrite: true,
          })
        }

        if (counterRef.current) counterRef.current.textContent = `0${activeIdx + 1}`

        dotRefs.current.forEach((dot, i) => {
          if (!dot) return
          gsap.set(dot, {
            width:      i === activeIdx ? '36px' : '14px',
            background: i === activeIdx ? 'var(--accent)' : 'rgba(255,255,255,0.2)',
            overwrite:  true,
          })
        })
      },
    })

    return () => st.kill()
  }, [])

  return (
    <div style={{ height: `${EXPS.length * 100}vh` }}>
      <section ref={sectionRef} className={styles.section}>

        {/* Particle canvas */}
        <WorkExpParticles slideIdx={slideIdx} />

        {/* Top bar */}
        <div className={styles.topBar}>
          <span className={styles.sectionLabel}>Work Experience</span>
          <div className={styles.counter}>
            <span ref={counterRef} className={styles.cCur}>01</span>
            <span className={styles.cSep}> / </span>
            <span className={styles.cTot}>0{EXPS.length}</span>
          </div>
        </div>

        {/* Horizontal track */}
        <div
          ref={trackRef}
          className={styles.track}
          style={{ width: `${EXPS.length * 100}vw` }}
        >
          {EXPS.map((exp, i) => (
            <div key={exp.id} className={styles.slide}>

              <div
                ref={el => { bgRefs.current[i] = el }}
                className={styles.slideBg}
              >
                <Image
                  src={IMAGES[i % IMAGES.length]}
                  alt="" fill quality={100} sizes="100vw"
                  className={styles.slideImg}
                  priority={i === 0}
                />
                <div className={styles.slideOverlayLeft}   aria-hidden />
                <div className={styles.slideOverlayBottom} aria-hidden />
                <div className={styles.slideVignette}      aria-hidden />
              </div>

              <span className={styles.slideNum} aria-hidden>0{i + 1}</span>

              <div
                ref={el => { contentRefs.current[i] = el }}
                className={styles.slideContent}
              >
                <div className={styles.slideLeft}>
                  <div className={styles.meta}>
                    <span className={styles.period}>{exp.period} – {exp.periodEnd}</span>
                    <span className={styles.typeTag}>{exp.type}</span>
                    <span className={styles.location}>{exp.location}</span>
                  </div>
                  <h2 className={styles.company}>{exp.company}</h2>
                  <p  className={styles.role}>{exp.role}</p>
                </div>

                <div className={styles.slideRight}>
                  <ul className={styles.bullets}>
                    {exp.bullets.map((b, bi) => (
                      <li key={bi} className={styles.bullet}>{b}</li>
                    ))}
                  </ul>
                  <div className={styles.stack}>
                    {exp.tech.map(t => (
                      <span key={t} className={styles.tag}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Bottom UI */}
        <div className={styles.bottomUI}>
          <div className={styles.progressTrack}>
            <div ref={progressRef} className={styles.progressBar} />
          </div>
          <div className={styles.dots}>
            {EXPS.map((_, i) => (
              <div
                key={i}
                ref={el => { dotRefs.current[i] = el }}
                className={styles.dot}
                style={{
                  width:      i === 0 ? '36px' : '14px',
                  background: i === 0 ? 'var(--accent)' : 'rgba(255,255,255,0.2)',
                }}
              />
            ))}
          </div>
        </div>

      </section>
    </div>
  )
}
