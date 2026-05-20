'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * Floating particle field — Three.js canvas overlay.
 * Particles drift slowly in 3D and follow mouse with a parallax offset.
 * Fully self-contained; cleans up on unmount.
 */
export default function ParticleField() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // ── Renderer ──────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // ── Scene / Camera ────────────────────────────────
    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100)
    camera.position.z = 6

    // ── Particles ─────────────────────────────────────
    const COUNT   = 320
    const pos     = new Float32Array(COUNT * 3)
    const sizes   = new Float32Array(COUNT)

    for (let i = 0; i < COUNT; i++) {
      // Spread in a wide slab in front of camera
      pos[i * 3 + 0] = (Math.random() - 0.5) * 22
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8
      sizes[i] = Math.random() * 0.5 + 0.5   // vary point sizes
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('size',     new THREE.BufferAttribute(sizes, 1))

    const mat = new THREE.PointsMaterial({
      color:          0xffffff,
      size:           0.06,
      sizeAttenuation: true,
      transparent:    true,
      opacity:        0.55,
      depthWrite:     false,
    })

    // Second, slightly larger sparse layer for depth
    const geo2   = geo.clone()
    const mat2   = new THREE.PointsMaterial({
      color:          0xff8c3a,   // accent orange tint
      size:           0.04,
      sizeAttenuation: true,
      transparent:    true,
      opacity:        0.25,
      depthWrite:     false,
    })

    const dots1 = new THREE.Points(geo,  mat)
    const dots2 = new THREE.Points(geo2, mat2)
    scene.add(dots1, dots2)

    // ── Mouse parallax ────────────────────────────────
    const mouse   = { x: 0, y: 0 }
    const target  = { x: 0, y: 0 }

    const onMouseMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth  - 0.5) * 1.5
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 1.0
    }
    window.addEventListener('mousemove', onMouseMove)

    // ── Resize ────────────────────────────────────────
    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight)
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)

    // ── Animation loop ────────────────────────────────
    const clock = new THREE.Clock()
    let animId

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      // Slow drift
      dots1.rotation.y = t * 0.025
      dots1.rotation.x = t * 0.010
      dots2.rotation.y = t * 0.018
      dots2.rotation.z = t * 0.008

      // Smooth camera parallax follows mouse
      target.x += (mouse.x - target.x) * 0.04
      target.y += (-mouse.y - target.y) * 0.04
      camera.position.x = target.x * 0.6
      camera.position.y = target.y * 0.4

      renderer.render(scene, camera)
    }
    animate()

    // ── Cleanup ───────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize',    onResize)
      geo.dispose(); geo2.dispose()
      mat.dispose(); mat2.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      'absolute',
        inset:         0,
        width:         '100%',
        height:        '100%',
        zIndex:        2,
        pointerEvents: 'none',
      }}
    />
  )
}
