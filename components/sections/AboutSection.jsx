'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { gsap } from '@/lib/gsap'
import { FaGithub, FaLinkedinIn, FaMedium, FaInstagram } from 'react-icons/fa'
import styles from '@/styles/sections/AboutSection.module.css'

const BIO =
  `Full-Stack Engineer with 4+ years building scalable web and AI-powered systems using MERN, Next.js, and Python. I specialize in microservices, high-performance APIs, and production-ready architectures that handle real-world scale. From data pipelines processing 100k+ SKUs to AI-driven platforms using FastAPI, LangChain, and vector databases, my focus is always on performance and clean system design. I've worked across the full product stack, from frontend architecture and microfrontends to backend systems, caching layers, and async job processing with Redis. I build systems that scale, perform, and deliver real impact.`

const TABS = ['I AM', 'WHO I AM']

const SOCIALS = [
  { Icon: FaGithub,    href: 'https://github.com/VaibhavKhushalani',    label: 'GitHub'    },
  { Icon: FaLinkedinIn, href: 'https://linkedin.com/in/vaibhav-khushalani', label: 'LinkedIn'  },
  { Icon: FaMedium,    href: 'https://medium.com/@vaibhavkhush124',      label: 'Medium'    },
  { Icon: FaInstagram, href: 'https://instagram.com/vaibhav.khushalani', label: 'Instagram' },
]

export default function AboutSection() {
  const sectionRef  = useRef(null)
  const photoRef    = useRef(null)
  const contentRef  = useRef(null)
  const socialsRef  = useRef(null)
  const intervalRef = useRef(null)
  const started     = useRef(false)

  const [typed,     setTyped]     = useState(0)
  const [done,      setDone]      = useState(false)
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    // Initial hidden states
    gsap.set(photoRef.current,   { opacity: 0, x: -50 })
    gsap.set(contentRef.current, { opacity: 0, y:  40 })
    const socialIcons = socialsRef.current?.querySelectorAll('a') ?? []
    gsap.set(socialIcons, { opacity: 0, y: 20 })

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return
        started.current = true

        // Entrance animations
        gsap.to(photoRef.current, {
          opacity: 1, x: 0, duration: 0.9, ease: 'power3.out',
        })
        gsap.to(contentRef.current, {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.15,
        })
        // Social icons stagger
        gsap.to(socialIcons, {
          opacity: 1, y: 0, duration: 0.5, ease: 'power2.out',
          stagger: 0.1, delay: 0.5,
        })

        // Typewriter
        let i = 0
        intervalRef.current = setInterval(() => {
          i += 1
          setTyped(i)
          if (i >= BIO.length) {
            clearInterval(intervalRef.current)
            setDone(true)
          }
        }, 11)
      },
      { threshold: 0.15 },
    )

    observer.observe(section)
    return () => {
      observer.disconnect()
      clearInterval(intervalRef.current)
    }
  }, [])

  return (
    <section ref={sectionRef} className={styles.section}>

      {/* ── Left: photo + signature + socials ───────── */}
      <div ref={photoRef} className={styles.photoCol}>
        <div className={styles.photoFrame}>
          <Image
            src="/assets/about.png"
            alt="Vaibhav Khushalani"
            fill
            className={styles.photoImg}
          />
        </div>

        <p className={styles.signature}>Vaibhav</p>

        {/* Social icons */}
        <div ref={socialsRef} className={styles.socials}>
          {SOCIALS.map(({ Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className={styles.socialLink}
            >
              <Icon />
            </a>
          ))}
        </div>
      </div>

      {/* ── Right: content ───────────────────────────── */}
      <div ref={contentRef} className={styles.content}>

        {/* Tabs */}
        <div className={styles.tabs}>
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`${styles.tab} ${i === activeTab ? styles.tabActive : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Bio text — typewriter */}
        <div className={styles.bioWrap}>
          <p className={styles.bio}>
            <span className={styles.typed}>{BIO.slice(0, typed)}</span>
            {!done && <span className={styles.cursor} aria-hidden="true" />}
            <span className={styles.untyped}>{BIO.slice(typed)}</span>
          </p>
        </div>

      </div>
    </section>
  )
}
