'use client'

import { useEffect, useRef, useState } from 'react'
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu'
import { Button } from '@/components/ui/button'
import { gsap } from '@/lib/gsap'
import styles from '@/styles/ui/Navbar.module.css'

const NAV_ITEMS = ['HOME', 'ABOUT', 'WORKS', 'SERVICES', 'EXPERIENCE']

function getIST() {
  return new Date().toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).toUpperCase()
}

export default function Navbar() {
  const [time, setTime] = useState(getIST())
  const headerRef = useRef(null)
  const lastY     = useRef(0)
  const hidden    = useRef(false)

  // Live clock
  useEffect(() => {
    const id = setInterval(() => setTime(getIST()), 1000)
    return () => clearInterval(id)
  }, [])

  // Auto-hide on scroll — listens on the scroll container (main)
  useEffect(() => {
    const scroller = document.querySelector('main') ?? window

    const onScroll = () => {
      const currentY = scroller.scrollTop ?? window.scrollY
      const delta    = currentY - lastY.current

      if (delta > 8 && !hidden.current) {
        // Scrolling down → hide
        gsap.to(headerRef.current, { y: '-100%', duration: 0.35, ease: 'power2.inOut' })
        hidden.current = true
      } else if (delta < -6 && hidden.current) {
        // Scrolling up → show
        gsap.to(headerRef.current, { y: '0%', duration: 0.35, ease: 'power2.out' })
        hidden.current = false
      }

      lastY.current = currentY
    }

    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => scroller.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header ref={headerRef} className={styles.header}>
      <span className={styles.time}>INDIA TIME - {time}</span>

      <NavigationMenu>
        <NavigationMenuList className="flex gap-6">
          {NAV_ITEMS.map(item => (
            <NavigationMenuItem key={item}>
              <NavigationMenuLink className={styles.navLink}>
                {item}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>

      <Button
        variant="outline"
        render={<a href="mailto:vaibhavkhush124@gmail.com">Email me</a>}
        className={`${styles.emailBtn} rounded-full text-xs font-semibold px-5 h-8`}
      />
    </header>
  )
}
