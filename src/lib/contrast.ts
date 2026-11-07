function channel(hex: string, start: number): number {
  const value = parseInt(hex.slice(start, start + 2), 16) / 255
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

export function luminance(hex: string): number {
  const normalized = hex.trim().toLowerCase()
  if (!/^#[0-9a-f]{6}$/.test(normalized)) {
    throw new Error(`Expected a 6-digit hex color, received ${hex}`)
  }
  return (
    0.2126 * channel(normalized, 1) +
    0.7152 * channel(normalized, 3) +
    0.0722 * channel(normalized, 5)
  )
}

export function contrastRatio(hexA: string, hexB: string): number {
  const lighter = Math.max(luminance(hexA), luminance(hexB))
  const darker = Math.min(luminance(hexA), luminance(hexB))
  return (lighter + 0.05) / (darker + 0.05)
}
