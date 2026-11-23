import { defaultTheme } from './default'
import type { Theme } from './theme'

export type { Theme } from './theme'
export { defaultTheme } from './default'

// CSS variable name for a theme color, e.g. ('app', 'textMuted') -> '--app-text-muted'.
function variableName(group: string, key: string) {
  return `--${group}-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`
}

// Publish a theme as CSS variables on the page root, so CSS and inline SVG styles can use them.
export function applyTheme(theme: Theme, root: HTMLElement = document.documentElement) {
  for (const [group, colors] of Object.entries(theme)) {
    for (const [key, value] of Object.entries(colors as Record<string, string>)) {
      root.style.setProperty(variableName(group, key), value)
    }
  }
}

// The same shape as a theme, but each value is a var(--…) reference. Use these in TSX so a
// typo is a type error and colors follow whichever theme is applied.
export const color = Object.fromEntries(
  Object.entries(defaultTheme).map(([group, colors]) => [
    group,
    Object.fromEntries(Object.keys(colors).map((key) => [key, `var(${variableName(group, key)})`])),
  ]),
) as unknown as Theme
