import { sum } from './domain/__sanity__/sum'

describe('sanity — test runner', () => {
  it('adds two numbers', () => {
    expect(sum(1, 2)).toBe(3)
  })

  it('handles negative numbers', () => {
    expect(sum(-1, 1)).toBe(0)
  })
})
