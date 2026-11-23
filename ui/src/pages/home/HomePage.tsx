import { useEffect, useState } from 'react'
import { getDevices, type GroupDevices } from '../../services/devices'
import DeviceGraph from './DeviceGraph'

export default function HomePage() {
  const [result, setResult] = useState<GroupDevices | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Effects can't be async themselves, so define and call an async function inside.
    const controller = new AbortController()

    async function loadDevices() {
      try {
        setResult(await getDevices(controller.signal))
      } catch (err) {
        // Leaving the page aborts the request; that isn't an error to show.
        if (controller.signal.aborted) return
        setError(err instanceof Error ? err.message : 'Could not load devices.')
      }
    }

    loadDevices()
    return () => controller.abort()
  }, [])

  if (error) return <p>{error}</p>
  // Loading is near-instant, so show nothing rather than flashing a loading message.
  if (!result) return null

  const currentDevice = result.devices.find((device) => device.id === result.currentDeviceId)
  if (!currentDevice) return <p>This device is not in its group's device list.</p>
  const peers = result.devices.filter((device) => device.id !== result.currentDeviceId)

  // Presence tracking doesn't exist yet, so no other device is known to be online.
  const onlineDeviceIds = new Set<string>()

  return <DeviceGraph currentDevice={currentDevice} peers={peers} onlineDeviceIds={onlineDeviceIds} />
}
