// Temporary: the UI calls the backend directly with a device token from .env.local.
// Once the local agent serves this list, only the URL and headers below change.
const backendUrl = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8080'
const deviceToken = import.meta.env.VITE_DEVICE_TOKEN

// Matches the database check on devices.device_type.
export type DeviceType = 'laptop' | 'desktop' | 'server'

// Mirrors the backend's DeviceSummary record. deviceType is null when the device never reported one.
export interface Device {
  id: string
  displayName: string
  deviceType: DeviceType | null
  registeredAt: string
}

// Mirrors the backend's GroupDevicesResponse record.
export interface GroupDevices {
  currentDeviceId: string
  devices: Device[]
}

// Lists the devices in this device's group.
export async function getDevices(signal?: AbortSignal): Promise<GroupDevices> {
  if (!deviceToken) {
    throw new Error('VITE_DEVICE_TOKEN is not set in ui/.env.local.')
  }

  const response = await fetch(`${backendUrl}/devices`, {
    headers: { Authorization: `Bearer ${deviceToken}` },
    signal,
  })
  if (!response.ok) {
    throw new Error(`Could not load devices (HTTP ${response.status}).`)
  }
  return response.json()
}

// Presence is mocked until the local agent can report reachable devices.
export { getOnlineDeviceIds } from './mock/devices'
