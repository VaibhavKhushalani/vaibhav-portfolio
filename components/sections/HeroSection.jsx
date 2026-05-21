'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { gsap } from '@/lib/gsap'
import profile from '@/data/profile.json'
import styles from '@/styles/sections/HeroSection.module.css'

const HeroBackground = dynamic(() => import('@/components/three/HeroBackground'), { ssr: false })

export default function HeroSection() {
  const sectionRef  = useRef(null)
  const greetRef    = useRef(null)
  const roleRef     = useRef(null)
  const firstName   = useRef(null)
  const lastName    = useRef(null)
  const photoRef    = useRef(null)
  const locationRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const targets = [
      greetRef.current, roleRef.current,
      firstName.current, lastName.current, locationRef.current,
    ].filter(Boolean)

    gsap.set(targets, { opacity: 0, y: 30 })
    if (photoRef.current) gsap.set(photoRef.current, { opacity: 0, x: 80 })

    const tl = gsap.timeline({ paused: true })
    tl.to(greetRef.current,    { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })
      .to(roleRef.current,     { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3')
      .to(firstName.current,   { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.2')
      .to(lastName.current,    { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4')
      .to(photoRef.current,    { opacity: 1, x: 0, duration: 0.7, ease: 'power2.out' }, '-=0.5')
      .to(locationRef.current, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3')

    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { tl.play(); observer.disconnect() } },
      { threshold: 0.3 },
    )
    observer.observe(section)
    return () => { observer.disconnect(); tl.kill() }
  }, [])

  return (
    <section ref={sectionRef} className={styles.section}>

      <HeroBackground />

      {/* Photo */}
      <div ref={photoRef} className={styles.photo}>
        <Image
          src="/assets/hero.png" alt={profile.name.full}
          fill priority quality={100}
          sizes="(min-width: 768px) 40vw, 100vw"
          className={styles.photoImg}
        />
      </div>

      {/* Greeting */}
      <div className={styles.greeting}>
        <p ref={greetRef} className={styles.greetText}>{"Hi, I'm"}</p>
        <p ref={roleRef}  className={styles.roleText}>{profile.roles.short}</p>
      </div>

      {/* First name */}
      <p ref={firstName} className={`${styles.name} ${styles.firstName}`}>
        {profile.name.first}
      </p>

      {/* Location */}
      <div ref={locationRef} className={styles.location}>
        <p className={styles.locationText}>{profile.location.based}</p>
        <p className={styles.locationText}>{profile.location.availability}</p>
      </div>

      {/* Last name */}
      <p ref={lastName} className={`${styles.name} ${styles.lastName}`}>
        {profile.name.last}
      </p>

    </section>
  )
}
