// Every color the UI uses. Add a color here first, then give each theme a value for it.
export interface Theme {
  // Page chrome: backgrounds, borders, and text.
  app: {
    background: string
    surface: string
    border: string
    text: string
    textMuted: string
    // Background behind any interactive row, link, or button while hovered.
    hover: string
    // Drop shadows under floating menus and dragged rows.
    shadow: string
  }
  // The band across the top of the app: page title and the sidebar brand.
  header: {
    background: string
    text: string
    // Line under the band; match the background to hide it.
    border: string
  }
  // Highlight colors: links, active navigation, and anything that glows.
  accent: {
    base: string
    // Accent used for text and links; must stay readable on app.background.
    bright: string
    // Tinted background for the active navigation item.
    soft: string
    // Text drawn on top of accent.base, e.g. a filled button.
    contrast: string
  }
  // Transfer outcomes need a consistent success color in every theme.
  status: {
    success: string
  }
  // Device graph wires and the dots where wires meet devices.
  graph: {
    wire: string
    wireLive: string
    dot: string
    dotLive: string
  }
  // The lit display inside device illustrations.
  screen: {
    glare: string
    light: string
    mid: string
    edge: string
    shade: string
    glow: string
    line: string
    lineCore: string
    bloom: string
  }
  // Device bodies: aluminum, plastic cases, bezels, and status lights.
  hardware: {
    silverLight: string
    silverDark: string
    deckLight: string
    deckDark: string
    frontLight: string
    frontDark: string
    caseLight: string
    caseDark: string
    caseEdge: string
    frame: string
    bezel: string
    bezelDetail: string
    keyboard: string
    trackpad: string
    notch: string
    vent: string
    bay: string
    bayEdge: string
    led: string
    highlight: string
  }
}

// A selectable theme: its colors plus whether native controls should render light or dark.
export interface ThemeDefinition {
  id: string
  name: string
  scheme: 'light' | 'dark'
  colors: Theme
}
