import { render, screen, fireEvent } from '@testing-library/react'

// ParticleField uses Three.js WebGL — stub it out in jsdom
jest.mock('next/dynamic', () => () => () => null)

import VideoIntro from '@/components/sections/VideoIntro'

describe('VideoIntro', () => {
  it('renders a video element', () => {
    render(<VideoIntro heroRef={{ current: null }} />)
    expect(screen.getByTestId('intro-video')).toBeInTheDocument()
  })

  it('video has autoPlay, muted, playsInline attrs', () => {
    render(<VideoIntro heroRef={{ current: null }} />)
    const video = screen.getByTestId('intro-video')
    expect(video.autoplay).toBe(true)
    expect(video.muted).toBe(true)
    expect(video.playsInline).toBe(true)
  })

  it('calls scrollIntoView on heroRef when video ends', () => {
    const scrollIntoView = jest.fn()
    const heroRef = { current: { scrollIntoView } }
    render(<VideoIntro heroRef={heroRef} />)
    fireEvent.ended(screen.getByTestId('intro-video'))
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
  })
})
