const TEXTUAL_INPUTS = new Set([
  'text',
  'email',
  'search',
  'url',
  'tel',
  'password',
  'number',
])

export type HotkeyAction = 'dmitry' | 'davis' | 'shuffle' | 'swap' | 'reset'

export function typingFromTag(tagName: string, type?: string, editable = false): boolean {
  if (editable) return true
  if (tagName === 'TEXTAREA' || tagName === 'SELECT') return true
  if (tagName === 'INPUT') return TEXTUAL_INPUTS.has(type ?? 'text')
  return false
}

export function isTypingTarget(target: EventTarget | null): boolean {
  if (!target || typeof HTMLElement === 'undefined' || !(target instanceof HTMLElement)) return false
  const type = target instanceof HTMLInputElement ? target.type : undefined
  return typingFromTag(target.tagName, type, target.isContentEditable)
}

export function hotkeyAction(event: {
  key: string
  metaKey: boolean
  ctrlKey: boolean
  altKey: boolean
}): HotkeyAction | null {
  if (event.metaKey || event.ctrlKey || event.altKey) return null
  switch (event.key.toLowerCase()) {
    case '1':
      return 'dmitry'
    case '2':
      return 'davis'
    case 's':
      return 'shuffle'
    case 'w':
      return 'swap'
    case 'r':
      return 'reset'
    default:
      return null
  }
}
