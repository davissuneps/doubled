export type Perspective = 'dmitry' | 'davis'

export const STORAGE_KEY = 'doubled-perspective'

export function deskLabel(perspective: Perspective): string {
  return perspective === 'dmitry' ? 'Dmitry' : 'Davis'
}

export function resolvePerspective(stored: string | null, prefersDark: boolean): Perspective {
  if (stored === 'dmitry' || stored === 'davis') return stored
  return prefersDark ? 'dmitry' : 'davis'
}

export function readStoredPerspective(): Perspective {
  let stored: string | null = null
  try {
    stored = localStorage.getItem(STORAGE_KEY)
  } catch {
    stored = null
  }
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  return resolvePerspective(stored, prefersDark)
}

export function storePerspective(perspective: Perspective): void {
  try {
    localStorage.setItem(STORAGE_KEY, perspective)
  } catch {
    /* Private mode and blocked storage should not break the desk switch. */
  }
}
