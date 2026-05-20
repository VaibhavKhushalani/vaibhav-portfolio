const nextJest = require('next/jest')

const createJestConfig = nextJest({ dir: './' })

module.exports = createJestConfig({
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/lib/gsap$': '<rootDir>/__mocks__/gsap.js',
    '^gsap$': '<rootDir>/__mocks__/gsap.js',
    '^gsap/ScrollTrigger$': '<rootDir>/__mocks__/gsap.js',
  },
})
