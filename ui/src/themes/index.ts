import { blueTheme } from './blue'
import { greenTheme } from './green'
import { greenDarkTheme } from './greenDark'
import type { Theme, ThemeDefinition } from './theme'

export type { Theme, ThemeDefinition } from './theme'

// Every theme offered in Settings, in display order. The first is the default.
export const themes: ThemeDefinition[] = [greenTheme, greenDarkTheme, blueTheme]
export const defaultTheme = greenTheme

const storageKey = 'theme'

// CSS variable name for a theme color, e.g. ('app', 'textMuted') -> '--app-text-muted'.
function variableName(group: string, key: string) {
  return `--${group}-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`
}

// Publish a theme as CSS variables on the page root, so CSS and inline SVG styles can use them.
export function applyTheme(theme: ThemeDefinition, root: HTMLElement = document.documentElement) {
  for (const [group, colors] of Object.entries(theme.colors)) {
    for (const [key, value] of Object.entries(colors as Record<string, string>)) {
      root.style.setProperty(variableName(group, key), value)
    }
  }
  root.style.colorScheme = theme.scheme
}

// The selected theme, remembered in localStorage so it survives reloads.
let current = themes.find((theme) => theme.id === localStorage.getItem(storageKey)) ?? defaultTheme
const listeners = new Set<() => void>()

export function getTheme() {
  return current
}

export function setTheme(id: string) {
  const next = themes.find((theme) => theme.id === id)
  if (!next || next === current) return
  current = next
  localStorage.setItem(storageKey, id)
  applyTheme(next)
  listeners.forEach((listener) => listener())
}

// For useSyncExternalStore, so the Settings picker re-renders when the theme changes.
export function subscribeTheme(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// The same shape as a theme, but each value is a var(--…) reference. Use these in TSX so a
// typo is a type error and colors follow whichever theme is applied.
export const color = Object.fromEntries(
  Object.entries(defaultTheme.colors).map(([group, colors]) => [
    group,
    Object.fromEntries(Object.keys(colors).map((key) => [key, `var(${variableName(group, key)})`])),
  ]),
) as unknown as Theme
