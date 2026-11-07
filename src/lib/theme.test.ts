import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { contrastRatio } from './contrast'
import { deskLabel, resolvePerspective, STORAGE_KEY } from './theme'
import { parseTokenBlock, resolveThemeTokens } from './tokens'

describe('perspective resolution', () => {
  it('prefers a stored desk, then the system scheme', () => {
    expect(resolvePerspective('davis', true)).toBe('davis')
    expect(resolvePerspective('dmitry', false)).toBe('dmitry')
    expect(resolvePerspective(null, true)).toBe('dmitry')
    expect(resolvePerspective('nope', false)).toBe('davis')
    expect(deskLabel('dmitry')).toBe('Dmitry')
  })

  it('uses the same storage key as the boot script', () => {
    const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8')
    expect(html).toContain(STORAGE_KEY)
    expect(html).toContain('#12110F')
    expect(html).toContain('#F4EFE6')
  })
})

describe('theme contrast', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8')
  const root = parseTokenBlock(css, ':root {')
  const dmitry = resolveThemeTokens(root, parseTokenBlock(css, ':root[data-theme="dmitry"]'))
  const davis = root

  function expectText(tokens: Record<string, string>, fg: string, bg: string) {
    expect(contrastRatio(tokens[fg], tokens[bg]), `${fg} on ${bg}`).toBeGreaterThanOrEqual(4.5)
  }

  function expectUi(tokens: Record<string, string>, fg: string, bg: string) {
    expect(contrastRatio(tokens[fg], tokens[bg]), `${fg} on ${bg}`).toBeGreaterThanOrEqual(3)
  }

  it.each([
    ['davis', davis],
    ['dmitry', dmitry],
  ])('keeps %s text and controls in range', (_name, tokens) => {
    expectText(tokens, 'fg', 'bg')
    expectText(tokens, 'muted', 'bg')
    expectText(tokens, 'fg', 'surface')
    expectText(tokens, 'muted', 'surface')
    expectText(tokens, 'accent', 'bg')
    expectText(tokens, 'accent', 'surface')
    expectText(tokens, 'accent-fg', 'accent')
    expectText(tokens, 'inverse-fg', 'inverse')
    expectText(tokens, 'inverse-muted', 'inverse')
    expectUi(tokens, 'line', 'bg')
    expectUi(tokens, 'line', 'surface')
  })
})
