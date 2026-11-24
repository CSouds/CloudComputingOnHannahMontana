import { ArrowLeftRight, UserRound } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router'
import { useSyncExternalStore } from 'react'
import { getActiveTransfer, subscribeActiveTransfer } from '../services/transfers'
import { mainRoutes, settingsRoute } from '../routes'

// Keep the selected active file visible across page navigation.
export default function AppLayout() {
  const activeTransfer = useSyncExternalStore(subscribeActiveTransfer, getActiveTransfer)
  const { pathname } = useLocation()
  const title = [...mainRoutes, settingsRoute].find((route) => route.path === pathname)?.title
  // Transfers shows the active job in its own content, so it hides the bar.
  const showTransferBar = pathname !== '/transfers'

  return (
    <div className="app">
      <aside className="sidebar">
        {/* Same height as the top bar, so the app name sits level with the page title. */}
        <div className="sidebar-brand">
          <ArrowLeftRight className="sidebar-brand-icon" size={22} aria-hidden="true" />
          Cross-Device
        </div>
        <nav className="sidebar-nav">
          {mainRoutes.map(({ path, title, icon: Icon }) => (
            <NavLink key={path} to={path} end>
              <Icon size={20} aria-hidden="true" />
              {title}
            </NavLink>
          ))}
        </nav>
        {/* Same height as the transfer bar, so its divider lines up with the bar's top border. */}
        <div className="sidebar-footer">
          <NavLink to={settingsRoute.path}>
            <settingsRoute.icon size={20} aria-hidden="true" />
            {settingsRoute.title}
          </NavLink>
        </div>
      </aside>

      <header className="topbar">
        <h1>{title}</h1>
        {/* Reserve a consistent account entry point until account features are available. */}
        <button className="account-button" type="button" disabled aria-label="Account" title="Accounts coming soon">
          <UserRound size={20} aria-hidden="true" />
        </button>
      </header>

      <main className="main">
        <Outlet />
      </main>

      {showTransferBar && (
        <footer className="transfer-bar" role="status">
          {activeTransfer && <span className="transfer-bar-active">Active transfer: <strong>{activeTransfer.name}</strong></span>}
        </footer>
      )}
    </div>
  )
}
