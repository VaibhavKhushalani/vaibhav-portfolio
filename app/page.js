'use client'

import { useRef } from 'react'
import Navbar       from '@/components/ui/Navbar'
import VideoIntro   from '@/components/sections/VideoIntro'
import HeroSection  from '@/components/sections/HeroSection'
import AboutSection from '@/components/sections/AboutSection'

export default function Home() {
  const heroRef = useRef(null)

  return (
    <>
      <Navbar />
      <main style={{ height: '100vh', overflowY: 'scroll', scrollSnapType: 'y mandatory' }}>
        <VideoIntro   heroRef={heroRef} />
        <HeroSection  ref={heroRef} />
        <AboutSection />
      </main>
    </>
  )
}
