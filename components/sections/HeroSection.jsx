'use client'

import { useEffect, useRef, forwardRef } from 'react'
import Image from 'next/image'
import { gsap } from '@/lib/gsap'
import styles from '@/styles/sections/HeroSection.module.css'

const HeroSection = forwardRef(function HeroSection(_, ref) {
  const sectionRef = useRef(null)
  const greetRef = useRef(null)
  const roleRef = useRef(null)
  const firstName = useRef(null)
  const lastName = useRef(null)
  const photoRef = useRef(null)
  const locationRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const targets = [
      greetRef.current,
      roleRef.current,
      firstName.current,
      lastName.current,
      locationRef.current,
    ].filter(Boolean)

    gsap.set(targets, { opacity: 0, y: 30 })
    if (photoRef.current) gsap.set(photoRef.current, { opacity: 0, x: 80 })

    const tl = gsap.timeline({ paused: true })
    tl.to(greetRef.current, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })
      .to(roleRef.current, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3')
      .to(firstName.current, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.2')
      .to(lastName.current, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4')
      .to(photoRef.current, { opacity: 1, x: 0, duration: 0.7, ease: 'power2.out' }, '-=0.5')
      .to(locationRef.current, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3')

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          tl.play()
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(section)

    return () => {
      observer.disconnect()
      tl.kill()
    }
  }, [])

  return (
    <section
      ref={node => {
        sectionRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      }}
      className={styles.section}
    >
      {/* Photo — right side, sits above name text */}
      <div ref={photoRef} className={styles.photo}>
        <Image
          src="/assets/hero.png"
          alt="Vaibhav Khushalani"
          fill
          priority
          className={styles.photoImg}
        />
      </div>

      {/* Greeting — vertically centered left, just above names */}
      <div className={styles.greeting}>
        <p ref={greetRef} className={styles.greetText}>{"Hi, I'm"}</p>
        <p ref={roleRef} className={styles.roleText}>Software Developer</p>
      </div>

      {/* First name */}
      <p ref={firstName} className={`${styles.name} ${styles.firstName}`}>
        Vaibhav
      </p>

      {/* Location — between names, center-right */}
      <div ref={locationRef} className={styles.location}>
        <p className={styles.locationText}>Based on India*</p>
        <p className={styles.locationText}>Available worldwide</p>
      </div>

      {/* Last name — bleeds off bottom edge */}
      <p ref={lastName} className={`${styles.name} ${styles.lastName}`}>
        Khushalani
      </p>
    </section>
  )
})

export default HeroSection
