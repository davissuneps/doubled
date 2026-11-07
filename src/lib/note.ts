export const NOTE_LIMIT = 1500

export function noteBody(text: string): string {
  const trimmed = text.trim()
  return trimmed.length > 0 ? trimmed.slice(0, NOTE_LIMIT) : 'Hello Double D — '
}

export function mailDraftHref(text: string): string {
  const body = noteBody(text)
  const params = new URLSearchParams({
    subject: 'Note for Double D',
    body,
  })
  return `mailto:?${params.toString()}`
}
