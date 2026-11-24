import { blueTheme } from './blue'
import { greenTheme } from './green'
import type { ThemeDefinition } from './theme'

// Built the way the blue theme is: every neutral shares one hue (164°, the header's forest green)
// and follows blue's saturation/lightness steps, so the page reads as tinted green rather than grey.
// The accent is the one vivid color, matched to blue's contrast, and the bright accent leans
// slightly toward mint the way blue's leans toward cyan.
export const greenDarkTheme: ThemeDefinition = {
  id: 'green-dark',
  name: 'Green Dark',
  scheme: 'dark',
  colors: {
    app: {
      background: '#0c1d18',
      surface: '#122822',
      border: '#283e38',
      text: '#e6efed',
      textMuted: '#8ca69f',
      hover: '#1a332c',
      shadow: '#00000080',
    },
    header: {
      background: '#1a3b32',
      text: '#e9f2ee',
      border: '#1a3b32',
    },
    accent: {
      base: '#1ba47b',
      bright: '#64d8aa',
      soft: '#104636',
      contrast: '#ffffff',
    },
    status: {
      success: '#8fe3a8',
    },
    graph: {
      wire: '#7f9a92',
      wireLive: '#1ba47b',
      dot: '#93aaa3',
      dotLive: '#1ba47b',
    },
    screen: greenTheme.colors.screen,
    // The blue theme's hardware was drawn for a dark page; keep it, with a green status light.
    hardware: { ...blueTheme.colors.hardware, led: '#5fdcb5' },
  },
}
