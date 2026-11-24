import { Check } from 'lucide-react'
import { useSyncExternalStore } from 'react'
import { getTheme, setTheme, subscribeTheme, themes } from '../../themes'
import './SettingsPage.css'

export default function SettingsPage() {
  const current = useSyncExternalStore(subscribeTheme, getTheme)

  return (
    <section className="settings-section" aria-labelledby="settings-theme">
      <h2 id="settings-theme">Theme</h2>
      <p className="settings-hint">Choose how the app looks on this device.</p>
      <div className="theme-options" role="radiogroup" aria-labelledby="settings-theme">
        {themes.map((theme) => {
          const selected = theme.id === current.id
          const { app, header, accent } = theme.colors
          return (
            <button
              key={theme.id}
              type="button"
              role="radio"
              aria-checked={selected}
              className="theme-option"
              onClick={() => setTheme(theme.id)}
            >
              {/* A miniature of the theme's own colors, independent of the theme currently applied. */}
              <span className="theme-swatch" style={{ background: app.background, borderColor: app.border }} aria-hidden="true">
                <span className="theme-swatch-header" style={{ background: header.background }} />
                <span className="theme-swatch-line" style={{ background: app.textMuted }} />
                <span className="theme-swatch-button" style={{ background: accent.base }} />
              </span>
              <span className="theme-option-label">
                {theme.name}
                {theme === themes[0] && <span className="theme-option-default">Default</span>}
              </span>
              {selected && <Check className="theme-option-check" size={18} aria-hidden="true" />}
            </button>
          )
        })}
      </div>
    </section>
  )
}
