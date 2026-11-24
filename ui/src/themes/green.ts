import { blueTheme } from './blue'
import type { ThemeDefinition } from './theme'

// Soft sage page, deep forest-green header, and teal-green accents. The default theme.
// Like the dark themes, every neutral is tinted with the header's green and nothing is pure white,
// so large surfaces stay calm instead of glaring.
export const greenTheme: ThemeDefinition = {
  id: 'green',
  name: 'Green',
  scheme: 'light',
  colors: {
    app: {
      background: '#e6ecea',
      surface: '#f0f5f3',
      border: '#c6d2ce',
      text: '#1c2c27',
      textMuted: '#586a65',
      hover: '#d8e1de',
      shadow: '#1c2c2733',
    },
    header: {
      background: '#2f6658',
      text: '#f0f5f3',
      border: '#2f6658',
    },
    accent: {
      base: '#367d70',
      bright: '#2a6a5d',
      soft: '#c8e0d9',
      contrast: '#ffffff',
    },
    status: {
      success: '#2f8a5a',
    },
    graph: {
      wire: '#93a39e',
      wireLive: '#367d70',
      dot: '#a3b3ae',
      dotLive: '#367d70',
    },
    screen: {
      glare: '#5cc4a6',
      light: '#2a8f77',
      mid: '#1c6a58',
      edge: '#104437',
      shade: '#0b382d',
      glow: '#6fdfbe',
      line: '#9cefd5',
      lineCore: '#e0fff4',
      bloom: '#69d8b6',
    },
    // Device bodies read well on a light page as-is; only the status light follows the accent.
    hardware: { ...blueTheme.colors.hardware, led: '#5fdcb5' },
  },
}
