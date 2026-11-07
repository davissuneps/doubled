import { describe, expect, it } from 'vitest'
import { mailDraftHref, noteBody, NOTE_LIMIT } from './note'

describe('notes', () => {
  it('keeps an empty note as a draft greeting and never adds a recipient', () => {
    expect(noteBody('   ')).toBe('Hello Double D — ')
    expect(noteBody('  Keep the gap.  ')).toBe('Keep the gap.')
    const href = mailDraftHref('Keep the gap.')
    expect(href.startsWith('mailto:?')).toBe(true)
    expect(href).not.toContain('mailto:someone')
    expect(decodeURIComponent(href.replace(/\+/g, ' '))).toContain('Keep the gap.')
  })

  it('caps a very long note', () => {
    expect(noteBody('d'.repeat(NOTE_LIMIT + 40))).toHaveLength(NOTE_LIMIT)
  })
})
