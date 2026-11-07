import { describe, expect, it } from 'vitest'
import {
  describeMark,
  glyphPaint,
  inBounds,
  inkLabel,
  motionActive,
  preset,
  readout,
  setMirror,
  setOffset,
  shuffle,
  swap,
  variation,
} from './mark'

function mulberry32(seed: number): () => number {
  let value = seed
  return () => {
    value |= 0
    value = (value + 0x6d2b79f5) | 0
    let t = Math.imul(value ^ (value >>> 15), 1 | value)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

describe('presets', () => {
  it('keeps both desks inside the safe ranges and distinct', () => {
    const dmitry = preset('dmitry')
    const davis = preset('davis')
    expect(inBounds(dmitry)).toBe(true)
    expect(inBounds(davis)).toBe(true)
    expect(dmitry.settings.weightA).toBeGreaterThan(dmitry.settings.weightB)
    expect(davis.settings.gap).toBeGreaterThan(dmitry.settings.gap)
    expect(dmitry.settings.ink).not.toBe(davis.settings.ink)
  })
})

describe('shuffle', () => {
  it('is deterministic and stays in bounds', () => {
    const start = preset('dmitry')
    const first = shuffle(start, mulberry32(7))
    const second = shuffle(start, mulberry32(7))
    expect(first).toEqual(second)
    expect(inBounds(first)).toBe(true)
    expect(first).not.toEqual(start)
    for (let seed = 1; seed <= 40; seed += 1) {
      const next = shuffle(preset(seed % 2 === 0 ? 'dmitry' : 'davis'), mulberry32(seed))
      expect(inBounds(next)).toBe(true)
      expect(next.settings.blend).toBe(false)
      if (next.settings.mirror) {
        expect(next.offsetB.x).toBeCloseTo(-next.offsetA.x)
        expect(next.offsetB.y).toBeCloseTo(next.offsetA.y)
      }
    }
  })
})

describe('swap and mirror', () => {
  it('exchanges the two cuts and flips an asymmetric ink', () => {
    const start = preset('dmitry')
    const swapped = swap(start)
    expect(swapped.settings.weightA).toBe(start.settings.weightB)
    expect(swapped.settings.weightB).toBe(start.settings.weightA)
    expect(swapped.settings.italicA).toBe(start.settings.italicB)
    expect(swapped.settings.ink).toBe('b-solid')
    expect(swapped.settings.rotation).toBe(-start.settings.rotation)
    expect(inBounds(swapped)).toBe(true)
    const mirrored = setMirror(setOffset(preset('davis'), 'a', { x: 30, y: 4 }), true)
    const swappedMirror = swap(mirrored)
    expect(swappedMirror.offsetB.x).toBeCloseTo(-swappedMirror.offsetA.x)
    expect(swappedMirror.offsetB.y).toBeCloseTo(swappedMirror.offsetA.y)
  })

  it('mirrors the second letter across the spine', () => {
    const moved = setOffset(preset('davis'), 'a', { x: 40, y: -12 })
    const mirrored = setMirror(moved, true)
    expect(mirrored.offsetA).toEqual({ x: 40, y: -12 })
    expect(mirrored.offsetB).toEqual({ x: -40, y: -12 })
    const fromB = setOffset(mirrored, 'b', { x: 18, y: 6 })
    expect(fromB.offsetB).toEqual({ x: 18, y: 6 })
    expect(fromB.offsetA).toEqual({ x: -18, y: 6 })
  })

  it('clamps a drag that leaves the sheet', () => {
    const moved = setOffset(preset('dmitry'), 'a', { x: 900, y: -800 })
    expect(moved.offsetA).toEqual({ x: 200, y: -200 })
    expect(moved.offsetB).toEqual({ x: -200, y: -200 })
  })
})

describe('glyph paint and copy', () => {
  it('gives outline letters a visible stroke', () => {
    const settings = preset('dmitry').settings
    expect(glyphPaint('a', settings).fill).toBe('fg')
    expect(glyphPaint('b', settings).fill).toBe('none')
    expect(glyphPaint('b', settings).strokeWidth).toBeGreaterThanOrEqual(2)
  })

  it('describes the live pairing in plain language', () => {
    const state = preset('davis')
    expect(inkLabel(state.settings.ink)).toBe('Davis solid, Dmitry outline')
    expect(describeMark(state)).toContain('Davis weight 780')
    expect(readout(state)).toContain('gap 210')
    expect(variation(860, 8, 144, false)).toContain('"WONK" 0')
    expect(motionActive(0.2, false)).toBe(true)
    expect(motionActive(0.2, true)).toBe(false)
    expect(motionActive(0, false)).toBe(false)
  })
})
