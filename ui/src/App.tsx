import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import AppLayout from './layout/AppLayout'
import HomePage from './pages/home/HomePage'
import DevicesPage from './pages/devices/DevicesPage'
import FilesPage from './pages/files/FilesPage'
import TransfersPage from './pages/transfers/TransfersPage'
import SettingsPage from './pages/settings/SettingsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/devices" element={<DevicesPage />} />
          <Route path="/files" element={<FilesPage />} />
          <Route path="/transfers" element={<TransfersPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
