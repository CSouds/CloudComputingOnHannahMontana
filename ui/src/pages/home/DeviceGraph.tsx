import { useEffect, useRef, useState } from 'react'
import type { Device } from '../../services/devices'
import { wirePaths } from './deviceGraph.logic'
import DeviceNode from './DeviceNode'
import './DeviceGraph.css'

interface DeviceGraphProps {
  currentDevice: Device
  peers: Device[]
  onlineDeviceIds: ReadonlySet<string>
}

// This device on the left, peers stacked on the right. Every peer is wired; online wires glow.
export default function DeviceGraph({ currentDevice, peers, onlineDeviceIds }: DeviceGraphProps) {
  const hasConnection = peers.some((peer) => onlineDeviceIds.has(peer.id))

  // Wires are drawn in real pixels, so measure the space between this device and its peers.
  const wiresRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  useEffect(() => {
    const element = wiresRef.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height })
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [peers.length])
  const paths = wirePaths(size.width, size.height, peers.length)

  return (
    <div className={hasConnection ? 'device-graph device-graph--connected' : 'device-graph'}>
      <div className="device-graph-current">
        <DeviceNode device={currentDevice} isCurrent />
      </div>

      {peers.length > 0 ? (
        <>
          <div className="device-graph-wires" ref={wiresRef}>
            {/* Dashed grey wires let users distinguish offline peers without relying on color. */}
            <svg width={size.width} height={size.height} aria-hidden="true">
              {peers.map((peer, index) => !onlineDeviceIds.has(peer.id) && (
                <path key={peer.id} className="wire wire--offline" d={paths[index]} />
              ))}
            </svg>
            {/* Online wires get their own layer so the CSS glow applies to them alone. */}
            {hasConnection && (
              <svg className="wires-online" width={size.width} height={size.height} aria-hidden="true">
                {peers.map((peer, index) => onlineDeviceIds.has(peer.id) && (
                  <path key={peer.id} className="wire wire--online" d={paths[index]} />
                ))}
              </svg>
            )}
          </div>

          <ul className="device-graph-peers">
            {peers.map((peer) => (
              <li key={peer.id}>
                <DeviceNode device={peer} isOnline={onlineDeviceIds.has(peer.id)} />
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="device-graph-empty">No other devices yet. Use Add device to connect one.</p>
      )}
    </div>
  )
}
