import { ArrowDownUp, Folder, House, Laptop, Settings, type LucideIcon } from 'lucide-react'

export interface AppRoute {
  path: string
  title: string
  icon: LucideIcon
}

// Single source for sidebar links, icons, and page titles.
export const mainRoutes: AppRoute[] = [
  { path: '/', title: 'Home', icon: House },
  { path: '/devices', title: 'Devices', icon: Laptop },
  { path: '/files', title: 'Files', icon: Folder },
  { path: '/transfers', title: 'Transfers', icon: ArrowDownUp },
]

export const settingsRoute: AppRoute = { path: '/settings', title: 'Settings', icon: Settings }
