import type { Device } from '../../services/devices'
import DeviceArt from './DeviceArt'

interface DeviceNodeProps {
  device: Device
  isCurrent?: boolean
  isOnline?: boolean
}

// One device card: illustration, name, and status. Display only; nothing here is interactive.
export default function DeviceNode({ device, isCurrent = false, isOnline = false }: DeviceNodeProps) {
  const className = ['device-node', isCurrent ? 'device-node--current' : 'device-node--peer',
    !isCurrent && isOnline ? 'device-node--online' : ''].join(' ')

  return (
    <div className={className}>
      <DeviceArt deviceType={device.deviceType} width={isCurrent ? 190 : 130} alignLeft={!isCurrent} />
      <span className="device-node-text">
        <span className="device-node-name">{device.displayName}</span>
        {/* The UI runs on this device, so it can never be offline; label it instead of showing a status. */}
        {isCurrent ? (
          <span className="device-node-label">This device</span>
        ) : (
          <span className="device-node-status">
            <span className="status-dot" aria-hidden="true" />
            {isOnline ? 'Online' : 'Offline'}
          </span>
        )}
      </span>
    </div>
  )
}
