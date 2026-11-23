import { ArrowLeftRight } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router'
import { mainRoutes, settingsRoute } from '../routes'

export default function AppLayout() {
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
      </header>

      <main className="main">
        <Outlet />
      </main>

      {showTransferBar && <footer className="transfer-bar" />}
    </div>
  )
}
