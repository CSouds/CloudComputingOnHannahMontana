// Every color the UI uses. Add a color here first, then give each theme a value for it.
export interface Theme {
  // Page chrome: backgrounds, borders, and text.
  app: {
    background: string
    surface: string
    border: string
    text: string
    textMuted: string
  }
  // Highlight colors: links, active navigation, and anything that glows.
  accent: {
    base: string
    bright: string
    brightest: string
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
