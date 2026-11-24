import type { Theme } from './theme'

// Dark charcoal with blue accents, as approved in docs/ui-design.md.
export const defaultTheme: Theme = {
  app: {
    background: '#0d1420',
    surface: '#141d2b',
    border: '#2a3342',
    text: '#e6e9ef',
    textMuted: '#8b95a5',
  },
  accent: {
    base: '#2f8cff',
    bright: '#5cc8ff',
    brightest: '#9fe2ff',
  },
  status: {
    success: '#8ee6ab',
  },
  graph: {
    wire: '#8a939f',
    wireLive: '#3f8ef7',
    dot: '#a3abb6',
    dotLive: '#3f8ef7',
  },
  screen: {
    glare: '#4aa3f0',
    light: '#1f66cf',
    mid: '#123f9c',
    edge: '#0a2766',
    shade: '#06205a',
    glow: '#4fc3ff',
    line: '#8fdcff',
    lineCore: '#dcf6ff',
    bloom: '#5fd0ff',
  },
  hardware: {
    silverLight: '#e4e8ee',
    silverDark: '#8d96a4',
    deckLight: '#f2f4f7',
    deckDark: '#b6bdc7',
    frontLight: '#aab1bc',
    frontDark: '#5c6470',
    caseLight: '#3a4352',
    caseDark: '#161b24',
    caseEdge: '#4a5566',
    frame: '#10151e',
    bezel: '#05080d',
    bezelDetail: '#1d2533',
    keyboard: '#2b313b',
    trackpad: '#c9cfd8',
    notch: '#737b87',
    vent: '#5b6678',
    bay: '#0d1118',
    bayEdge: '#323b4a',
    led: '#4fc3ff',
    highlight: '#ffffff',
  },
}
