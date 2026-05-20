const timelineMock = {
  fromTo: jest.fn().mockReturnThis(),
  to: jest.fn().mockReturnThis(),
  play: jest.fn().mockReturnThis(),
  paused: jest.fn().mockReturnThis(),
}

const gsap = {
  registerPlugin: jest.fn(),
  fromTo: jest.fn(),
  to: jest.fn(),
  set: jest.fn(),
  timeline: jest.fn(() => timelineMock),
}

const ScrollTrigger = {
  create: jest.fn(),
  refresh: jest.fn(),
}

module.exports = { gsap, ScrollTrigger }
