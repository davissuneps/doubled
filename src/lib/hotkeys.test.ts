import { describe, expect, it } from 'vitest'
import { hotkeyAction, typingFromTag } from './hotkeys'

describe('hotkeys', () => {
  it('maps the desk keys and ignores chords', () => {
    expect(hotkeyAction({ key: 's', metaKey: false, ctrlKey: false, altKey: false })).toBe('shuffle')
    expect(hotkeyAction({ key: 'W', metaKey: false, ctrlKey: false, altKey: false })).toBe('swap')
    expect(hotkeyAction({ key: '1', metaKey: false, ctrlKey: false, altKey: false })).toBe('dmitry')
    expect(hotkeyAction({ key: '2', metaKey: false, ctrlKey: false, altKey: false })).toBe('davis')
    expect(hotkeyAction({ key: 'r', metaKey: false, ctrlKey: false, altKey: false })).toBe('reset')
    expect(hotkeyAction({ key: 's', metaKey: true, ctrlKey: false, altKey: false })).toBeNull()
    expect(hotkeyAction({ key: 'k', metaKey: false, ctrlKey: false, altKey: false })).toBeNull()
  })

  it('lets shortcuts through sliders but not through the note field', () => {
    expect(typingFromTag('TEXTAREA')).toBe(true)
    expect(typingFromTag('INPUT', 'range')).toBe(false)
    expect(typingFromTag('INPUT', 'text')).toBe(true)
    expect(typingFromTag('BUTTON')).toBe(false)
    expect(typingFromTag('DIV', undefined, true)).toBe(true)
  })
})
