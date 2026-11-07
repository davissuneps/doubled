export type TokenMap = Record<string, string>

export function parseTokenBlock(css: string, selector: string): TokenMap {
  const start = css.indexOf(selector)
  if (start < 0) throw new Error(`Missing selector ${selector}`)
  const open = css.indexOf('{', start)
  const close = css.indexOf('}', open)
  if (open < 0 || close < 0) throw new Error(`Unclosed block for ${selector}`)
  const tokens: TokenMap = {}
  for (const line of css.slice(open + 1, close).split(';')) {
    const match = line.match(/--([\w-]+)\s*:\s*(#[0-9A-Fa-f]{6})/)
    if (match) tokens[match[1]] = match[2].toUpperCase()
  }
  return tokens
}

export function resolveThemeTokens(root: TokenMap, override: TokenMap): TokenMap {
  return { ...root, ...override }
}
