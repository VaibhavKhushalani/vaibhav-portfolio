'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import * as THREE from 'three'
import { gsap } from '@/lib/gsap'
import {
  FaGithub, FaLinkedinIn, FaMedium, FaInstagram, FaYoutube, FaEnvelope,
} from 'react-icons/fa'
import profile from '@/data/profile.json'
import styles from '@/styles/sections/PublicationsFooterSection.module.css'

const PUBS = profile.publications

const SOCIAL_ICONS = {
  GitHub:    <FaGithub    size={13} />,
  LinkedIn:  <FaLinkedinIn  size={13} />,
  Medium:    <FaMedium    size={13} />,
  Instagram: <FaInstagram size={13} />,
  YouTube:   <FaYoutube   size={13} />,
}

const VID_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const VID_FRAG = `
  uniform sampler2D uVideo;
  uniform float uOpacity;
  uniform float uVideoAspect;
  uniform float uCanvasAspect;
  varying vec2 vUv;
  void main() {
    vec2 uv = vUv;
    if (uCanvasAspect > uVideoAspect) {
      float s = uVideoAspect / uCanvasAspect;
      uv.y = (vUv.y - 0.5) * s + 0.5;
    } else {
      float s = uCanvasAspect / uVideoAspect;
      uv.x = (vUv.x - 0.5) * s + 0.5;
    }
    vec4 tex = texture2D(uVideo, uv);
    float fadeY =
      smoothstep(0.0, 0.05, uv.y) *
      smoothstep(1.0, 0.95, uv.y);
    float alpha = fadeY * uOpacity;
    float lum = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
    vec3 col = mix(vec3(lum), tex.rgb, 0.72);
    float vx = smoothstep(0.0, 0.38, abs(uv.x - 0.5) * 2.0);
    vec3 dark = vec3(0.008, 0.008, 0.008);
    col = mix(col, dark, vx * 0.82);
    col *= 0.68;
    gl_FragColor = vec4(col, alpha);
  }
`

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

export default function PublicationsFooterSection() {
  const wrapperRef = useRef(null)
  const stickyRef  = useRef(null)

  // image
  const imageWrapRef    = useRef(null)
  const imageOverlayRef = useRef(null)

  // publication content
  const pubContentRef = useRef(null)
  const labelRef      = useRef(null)
  const headingRef    = useRef(null)
  const dividerRef    = useRef(null)
  const itemRefs      = useRef([])

  // image-only interstitial
  const interstitialRef = useRef(null)

  // footer
  const canvasRef       = useRef(null)
  const videoSrcRef     = useRef(null)
  const footerContentRef = useRef(null)
  const leftRef         = useRef(null)
  const rightRef        = useRef(null)
  const bigNameRef      = useRef(null)
  const bottomBarRef    = useRef(null)

  useEffect(() => {
    const wrapper  = wrapperRef.current
    const sticky   = stickyRef.current
    const canvas   = canvasRef.current
    const videoEl  = videoSrcRef.current
    const scroller = document.querySelector('main')
    if (!wrapper || !sticky || !canvas || !videoEl || !scroller) return

    // ── Three.js video setup ──────────────────────────────────
    const W = sticky.offsetWidth
    const H = sticky.offsetHeight

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setSize(W, H)
    renderer.setClearColor(0x000000, 0)

    const scene  = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-W / 2, W / 2, H / 2, -H / 2, 0.1, 100)
    camera.position.z = 10

    videoEl.src       = '/assets/footer-video.mp4'
    videoEl.muted     = true
    videoEl.playsInline = true
    videoEl.loop      = true
    videoEl.preload   = 'auto'

    const vidTex = new THREE.VideoTexture(videoEl)
    vidTex.minFilter = THREE.LinearFilter
    vidTex.magFilter = THREE.LinearFilter

    const vidUni = {
      uVideo:       { value: vidTex },
      uOpacity:     { value: 0 },
      uVideoAspect: { value: 16 / 9 },
      uCanvasAspect: { value: W / H },
    }
    videoEl.addEventListener('loadedmetadata', () => {
      if (videoEl.videoWidth && videoEl.videoHeight)
        vidUni.uVideoAspect.value = videoEl.videoWidth / videoEl.videoHeight
    }, { once: true })
    const vidMat = new THREE.ShaderMaterial({
      uniforms: vidUni,
      vertexShader: VID_VERT,
      fragmentShader: VID_FRAG,
      transparent: true,
    })
    const vidMesh = new THREE.Mesh(new THREE.PlaneGeometry(W * 1.08, H * 1.08), vidMat)
    vidMesh.position.z = 1
    scene.add(vidMesh)

    const mx = { tx: 0, ty: 0, x: 0, y: 0 }
    function onMouseMove(e) {
      const r = sticky.getBoundingClientRect()
      mx.tx = (e.clientX - r.left) / r.width  - 0.5
      mx.ty = (e.clientY - r.top)  / r.height - 0.5
    }
    sticky.addEventListener('mousemove', onMouseMove)

    function onResize() {
      const w = sticky.offsetWidth
      const h = sticky.offsetHeight
      renderer.setSize(w, h)
      camera.left   = -w / 2; camera.right  = w / 2
      camera.top    =  h / 2; camera.bottom = -h / 2
      camera.updateProjectionMatrix()
      vidUni.uCanvasAspect.value = w / h
    }
    window.addEventListener('resize', onResize)

    let rafId
    function tick() {
      rafId = requestAnimationFrame(tick)
      mx.x += (mx.tx - mx.x) * 0.04
      mx.y += (mx.ty - mx.y) * 0.04
      vidMesh.position.x = mx.x * 14
      vidMesh.position.y = mx.y * -8
      vidTex.needsUpdate = true
      renderer.render(scene, camera)
    }
    tick()

    // ── Publication entry animation ───────────────────────────
    let pubAnimDone = false

    function resetPubAnim() {
      pubAnimDone = false
      gsap.set(labelRef.current,   { opacity: 0, y: -16, rotateX: 40, transformPerspective: 500, transformOrigin: '50% 0%' })
      gsap.set(headingRef.current, { opacity: 0, y: -30, rotateX: 35, transformPerspective: 700, transformOrigin: '50% 0%' })
      gsap.set(dividerRef.current, { scaleX: 0, transformOrigin: 'left center' })
      itemRefs.current.forEach(el => {
        if (el) gsap.set(el, { opacity: 0, y: 28, rotateX: 18, transformPerspective: 900, transformOrigin: '50% 0%' })
      })
    }

    function playPubAnim() {
      if (pubAnimDone) return
      pubAnimDone = true
      gsap.to(labelRef.current,   { opacity: 1, y: 0, rotateX: 0, duration: 0.55, ease: 'power3.out' })
      gsap.to(headingRef.current, { opacity: 1, y: 0, rotateX: 0, duration: 0.75, ease: 'expo.out', delay: 0.08 })
      gsap.to(dividerRef.current, { scaleX: 1, duration: 0.7, ease: 'power2.inOut', delay: 0.25 })
      itemRefs.current.forEach((el, i) => {
        if (el) gsap.to(el, { opacity: 1, y: 0, rotateX: 0, duration: 0.6, ease: 'power3.out', delay: 0.32 + i * 0.1 })
      })
    }

    // ── Initial image position (full-width background) ───────
    function setImageLeft() {
      const vw = window.innerWidth
      gsap.set(imageWrapRef.current, { width: vw, x: 0, opacity: 1 })
      if (imageOverlayRef.current) gsap.set(imageOverlayRef.current, { opacity: 1 })
    }

    // ── Scroll-driven animation ───────────────────────────────
    let videoPlaying = false

    function onScroll() {
      const scrollTop   = scroller.scrollTop
      const wrapperTop  = wrapper.offsetTop
      const vh          = window.innerHeight
      const dist        = scrollTop - wrapperTop

      // Entry: play pub animation when section first enters view
      if (dist > -vh * 0.5 && dist < vh * 0.35) {
        playPubAnim()
      } else if (dist < -vh * 0.4) {
        resetPubAnim()
        setImageLeft()
      }

      // Progress 0→1 over 2 viewports (3 scroll steps: pub / image-only / footer)
      // p=0: publications  p=0.5: image-only  p=1: footer
      const p = Math.max(0, Math.min(1, dist / (2 * vh)))

      // ── Phase 1: pub text fades out (p 0 → 0.28) ────────
      const pubFade = 1 - Math.max(0, Math.min(1, p / 0.28))
      gsap.set(pubContentRef.current, { opacity: pubFade, pointerEvents: pubFade > 0.05 ? 'auto' : 'none' })

      // ── Phase 2: image shrinks full-width → centered (p 0.15 → 0.72) ──
      const imgRaw = Math.max(0, Math.min(1, (p - 0.15) / 0.57))
      const imgP   = easeInOut(imgRaw)

      const vw      = window.innerWidth
      const startW  = vw          // 100% — full background
      const endW    = vw * 0.46   // 46% — centered portrait
      const w       = startW + imgP * (endW - startW)
      const centerX = imgP * (vw - w) / 2

      // Dark overlay fades as image shrinks (readable in pub phase, gone in image-only)
      if (imageOverlayRef.current) {
        gsap.set(imageOverlayRef.current, { opacity: 1 - imgP })
      }

      // ── Interstitial: fade in after pub, fade out before footer (p 0.25 → 0.40 → 0.60 → 0.72) ──
      const interIn  = Math.max(0, Math.min(1, (p - 0.25) / 0.15))
      const interOut = Math.max(0, Math.min(1, (p - 0.60) / 0.12))
      gsap.set(interstitialRef.current, { opacity: interIn * (1 - interOut), pointerEvents: 'none' })

      // ── Phase 3: video crossfade + image fade (p 0.68 → 0.88) ──
      const imgOpacity = 1 - Math.max(0, Math.min(1, (p - 0.68) / 0.20))
      gsap.set(imageWrapRef.current, { width: w, x: centerX, opacity: imgOpacity })

      const videoFade = Math.max(0, Math.min(1, (p - 0.65) / 0.22))
      vidUni.uOpacity.value = videoFade

      if (videoFade > 0.04 && !videoPlaying) {
        videoPlaying = true
        videoEl.play().catch(() => {})
      } else if (videoFade <= 0.04 && videoPlaying) {
        videoPlaying = false
        videoEl.pause()
        videoEl.currentTime = 0
      }

      // ── Phase 3: footer text fades in (p 0.75 → 1.0) ───
      const footerFade = Math.max(0, Math.min(1, (p - 0.75) / 0.25))
      gsap.set(footerContentRef.current, { opacity: footerFade, pointerEvents: footerFade > 0.05 ? 'auto' : 'none' })
    }

    resetPubAnim()
    setImageLeft()
    scroller.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      cancelAnimationFrame(rafId)
      scroller.removeEventListener('scroll', onScroll)
      sticky.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
    }
  }, [])

  const year = new Date().getFullYear()

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <div ref={stickyRef} className={styles.sticky}>

        {/* ── Video canvas (footer background) ── */}
        <canvas ref={canvasRef} className={styles.glCanvas} />
        <video ref={videoSrcRef} className={styles.hiddenVideo} />

        {/* ── Floating image: starts left, moves to center ── */}
        <div ref={imageWrapRef} className={styles.imageWrap}>
          <Image
            src="/assets/footer.png"
            alt=""
            fill
            className={styles.imageEl}
            sizes="(max-width: 767px) 100vw, 50vw"
            priority={false}
          />
          <div ref={imageOverlayRef} className={styles.imageOverlay} />
        </div>

        {/* ── Publication content (right of image) ── */}
        <div ref={pubContentRef} className={styles.pubContent}>
          <span className={styles.watermark} aria-hidden>WRITING</span>

          <div className={styles.pubHero}>
            <p  ref={labelRef}   className={styles.label}>Research &amp; Writing</p>
            <h2 ref={headingRef} className={styles.heading}>Publications</h2>
          </div>

          <div ref={dividerRef} className={styles.divider} />

          <div className={styles.list}>
            {PUBS.map((pub, i) => (
              <a
                key={pub.id}
                href={pub.link}
                target="_blank"
                rel="noopener noreferrer"
                ref={el => { itemRefs.current[i] = el }}
                className={styles.item}
              >
                <div className={styles.num}>0{i + 1}.</div>
                <div className={styles.itemBody}>
                  <div className={styles.itemTop}>
                    <h3 className={styles.title}>{pub.title}</h3>
                    <span className={styles.platform}>{pub.platform}</span>
                  </div>
                  <p className={styles.desc}>{pub.desc}</p>
                </div>
                <div className={styles.itemRight}>
                  <span className={styles.year}>{pub.year}</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* ── Image-only interstitial (step 2) ── */}
        <div ref={interstitialRef} className={styles.interstitial} aria-hidden>

          <div className={styles.interstitialLeft}>
            <div className={styles.interStat}>
              <span className={styles.interLabel}>Availability</span>
              <span className={styles.interBig}>Worldwide</span>
            </div>
            <div className={styles.interDividerH} />
            <div className={styles.interStat}>
              <span className={styles.interLabel}>Based in</span>
              <span className={styles.interBig}>India</span>
            </div>
          </div>

          <div className={styles.interstitialRight}>
            <div className={styles.interNum}>
              <span className={styles.interCount}>4+</span>
              <span className={styles.interNumLabel}>Years<br />experience</span>
            </div>
            <div className={styles.interDividerV} />
            <div className={styles.interNum}>
              <span className={styles.interCount}>15+</span>
              <span className={styles.interNumLabel}>Projects<br />delivered</span>
            </div>
            <div className={styles.interDividerV} />
            <div className={styles.interNum}>
              <span className={styles.interCount}>3</span>
              <span className={styles.interNumLabel}>Companies<br />worked at</span>
            </div>
          </div>

          <div className={styles.interstitialBottom}>
            <span className={styles.interScrollText}>Continue</span>
            <span className={styles.interScrollLine} />
          </div>

        </div>

        {/* ── Radial vignette (footer phase) ── */}
        <div className={styles.vignetteOverlay} aria-hidden />

        {/* ── Footer content ── */}
        <div ref={footerContentRef} className={styles.footerContent}>
          <div className={styles.mainGrid}>

            <div ref={leftRef} className={styles.leftCol}>
              <div className={styles.identityBlock}>
                <p className={styles.greetLine}>
                  <span className={styles.greetDot} />
                  {getGreeting()}
                </p>
                <p className={styles.roleLabel}>{profile.roles.short}</p>
                <h2 className={styles.nameHeading}>
                  {profile.name.first}
                  <br />
                  <span className={styles.nameGhost}>{profile.name.last}</span>
                </h2>
              </div>

              <div className={styles.footerInfo}>
                <p className={styles.footerDescription}>
                  Building cinematic digital experiences,
                  scalable systems, and AI-powered products
                  with modern web technologies.
                </p>
                <div className={styles.footerLinks}>
                  {profile.socials.slice(0, 4).map((s, i) => (
                    <span key={s.label} className={styles.footerLinkWrap}>
                      {i > 0 && <span className={styles.footerPipe}>|</span>}
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.footerLink}
                      >
                        {SOCIAL_ICONS[s.label] && (
                          <span className={styles.socialIcon}>{SOCIAL_ICONS[s.label]}</span>
                        )}
                        {s.label}
                      </a>
                    </span>
                  ))}
                </div>
                <a href={`mailto:${profile.email}`} className={styles.footerMail}>
                  <FaEnvelope size={12} />
                  {profile.email}
                </a>
              </div>
            </div>

            <div className={styles.centerSpace} />

            <div ref={rightRef} className={styles.rightCol}>
              <div className={styles.ctaBlock}>
                <p className={styles.ctaEyebrow}>Available for collaborations</p>
                <p className={styles.ctaHeading}>
                  Crafting modern
                  <br />
                  digital products
                  <br />
                  that feel
                  <br />
                  <span className={styles.ctaAccent}>alive.</span>
                </p>
                <a href={`mailto:${profile.email}`} className={styles.talkBtn}>
                  Let&apos;s talk →
                </a>
              </div>
            </div>

          </div>

          <div ref={bigNameRef} className={styles.signatureWrap}>
            <h2 className={styles.signatureText}>VAIBHAV KHUSHALANI</h2>
          </div>

          <div ref={bottomBarRef} className={styles.bottomBar}>
            <div className={styles.bottomLeft}>
              <div className={styles.monogram}>
                <span className={styles.monoLetters}>VK</span>
                <span className={styles.monoDot} />
              </div>
              <span className={styles.leftDivider} />
              <div className={styles.copyBlock}>
                <p className={styles.copy}>© {year} VAIBHAV KHUSHALANI</p>
                <p className={styles.copyAll}>ALL RIGHTS RESERVED</p>
              </div>
            </div>
            <div className={styles.bottomRight}>
              <span className={styles.builtWith}>
                DESIGNED &amp; DEVELOPED
                <br />
                WITH PRECISION.
              </span>
              <span className={styles.barDivider} />
              <span className={styles.sunIcon}>✺</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
