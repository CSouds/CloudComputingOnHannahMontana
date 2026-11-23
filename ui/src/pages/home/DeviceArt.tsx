import { useId } from 'react'
import type { CSSProperties } from 'react'
import type { DeviceType } from '../../services/devices'
import { color } from '../../themes'

const { screen, hardware } = color

// Inline styles rather than fill/stroke attributes: CSS variables are reliable in style properties.
const fill = (value: string): CSSProperties => ({ fill: value })
const stop = (value: string): CSSProperties => ({ stopColor: value })

interface ScreenProps {
  x: number
  y: number
  width: number
  height: number
  id: string
}

// A lit display modeled on the reference: bright blue, lighter toward the top left, crossed by
// thin glowing light lines with a soft bloom where they rise toward the top right.
function Screen({ x, y, width, height, id }: ScreenProps) {
  const at = (fx: number, fy: number) => `${x + width * fx} ${y + height * fy}`
  const clipId = `${id}-screen-clip-${x}`
  const mainLine = `M ${at(0, 0.9)} C ${at(0.3, 0.85)}, ${at(0.55, 0.62)}, ${at(0.7, 0.48)} S ${at(0.9, 0.24)}, ${at(1, 0.18)}`
  const lowerLine = `M ${at(0.08, 1.02)} C ${at(0.4, 0.86)}, ${at(0.6, 0.66)}, ${at(0.78, 0.5)} S ${at(0.93, 0.38)}, ${at(1, 0.35)}`
  return (
    <g clipPath={`url(#${clipId})`}>
      <clipPath id={clipId}>
        <rect x={x} y={y} width={width} height={height} rx={0.6} />
      </clipPath>
      <rect x={x} y={y} width={width} height={height} fill={`url(#${id}-screen)`} />
      {/* Deeper blue under the lines gives the sweep its depth. */}
      <path d={`${lowerLine} V ${y + height} H ${x} Z`} style={fill(screen.shade)} opacity={0.35} />
      {/* Soft bloom where the light lines rise. */}
      <ellipse cx={x + width * 0.66} cy={y + height * 0.52} rx={width * 0.22} ry={height * 0.1}
        transform={`rotate(-28 ${x + width * 0.66} ${y + height * 0.52})`}
        style={fill(screen.bloom)} opacity={0.4} filter={`url(#${id}-bloom)`} />
      {/* Each line is a wide blurred glow under a thin bright core. */}
      <path d={lowerLine} fill="none" style={{ stroke: screen.glow }} strokeWidth={1.4} opacity={0.3} filter={`url(#${id}-glow)`} />
      <path d={lowerLine} fill="none" style={{ stroke: screen.line }} strokeWidth={0.35} opacity={0.6} />
      <path d={mainLine} fill="none" style={{ stroke: screen.glow }} strokeWidth={2.2} opacity={0.6} filter={`url(#${id}-glow)`} />
      <path d={mainLine} fill="none" style={{ stroke: screen.lineCore }} strokeWidth={0.45} opacity={0.95} />
    </g>
  )
}

// Gradients and filters each illustration needs; ids are per instance so several devices can share a page.
function Gradients({ id }: { id: string }) {
  return (
    <defs>
      <radialGradient id={`${id}-screen`} cx="0.28" cy="0.2" r="0.95">
        <stop offset="0%" style={stop(screen.glare)} />
        <stop offset="35%" style={stop(screen.light)} />
        <stop offset="70%" style={stop(screen.mid)} />
        <stop offset="100%" style={stop(screen.edge)} />
      </radialGradient>
      <filter id={`${id}-glow`} x="-20%" y="-50%" width="140%" height="200%">
        <feGaussianBlur stdDeviation="1.1" />
      </filter>
      <filter id={`${id}-bloom`} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2.5" />
      </filter>
      <linearGradient id={`${id}-silver`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" style={stop(hardware.silverLight)} />
        <stop offset="100%" style={stop(hardware.silverDark)} />
      </linearGradient>
      <linearGradient id={`${id}-deck`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" style={stop(hardware.deckLight)} />
        <stop offset="100%" style={stop(hardware.deckDark)} />
      </linearGradient>
      <linearGradient id={`${id}-front`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" style={stop(hardware.frontLight)} />
        <stop offset="100%" style={stop(hardware.frontDark)} />
      </linearGradient>
      <linearGradient id={`${id}-case`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" style={stop(hardware.caseLight)} />
        <stop offset="100%" style={stop(hardware.caseDark)} />
      </linearGradient>
    </defs>
  )
}

// Modeled on the reference: thin silver lid edge, black bezel with a deeper bottom chin,
// and a wider aluminum base showing a strip of keyboard and the front notch.
function LaptopArt({ id }: { id: string }) {
  return (
    <>
      {/* Lid */}
      <rect x="22" y="4" width="76" height="52" rx="3.5" fill={`url(#${id}-silver)`} />
      <rect x="22.8" y="4.8" width="74.4" height="50.8" rx="2.9" style={fill(hardware.bezel)} />
      <Screen x={24.4} y={7.2} width={71.2} height={45.4} id={id} />
      <circle cx="60" cy="6" r="0.45" style={fill(hardware.bezelDetail)} />
      <rect x="57" y="53.9" width="6" height="0.5" rx="0.25" style={fill(hardware.bezelDetail)} />
      {/* Base: top deck at a slight angle with the keyboard edge, then the front edge with its notch. */}
      <path d="M 21 56.2 H 99 L 109 60 H 11 Z" fill={`url(#${id}-deck)`} />
      <path d="M 25 56.5 H 95 L 96.5 57.6 H 23.5 Z" style={fill(hardware.keyboard)} />
      <path d="M 50 58.6 H 70 L 70.6 59.6 H 49.4 Z" style={fill(hardware.trackpad)} opacity="0.8" />
      <path d="M 11 60 H 109 V 61.6 Q 109 63.4 107 63.4 H 13 Q 11 63.4 11 61.6 Z" fill={`url(#${id}-front)`} />
      <path d="M 52 60 H 68 Q 68 61.3 66.7 61.3 H 53.3 Q 52 61.3 52 60 Z" style={fill(hardware.notch)} />
      <path d="M 11.5 60 H 108.5" style={{ stroke: hardware.highlight }} strokeWidth="0.35" opacity="0.6" />
    </>
  )
}

function DesktopArt({ id }: { id: string }) {
  return (
    <>
      <rect x="4" y="6" width="80" height="54" rx="3" style={fill(hardware.frame)} stroke={`url(#${id}-silver)`} strokeWidth="1.5" />
      <Screen x={8} y={10} width={72} height={46} id={id} />
      <rect x="40" y="60" width="8" height="9" fill={`url(#${id}-silver)`} />
      <rect x="29" y="68" width="30" height="4" rx="2" fill={`url(#${id}-silver)`} />
      <rect x="92" y="10" width="24" height="62" rx="3" fill={`url(#${id}-case)`} style={{ stroke: hardware.caseEdge }} strokeWidth="0.8" />
      <rect x="96" y="15" width="16" height="1.5" rx="0.75" style={fill(hardware.vent)} />
      <circle cx="104" cy="64" r="1.6" style={fill(hardware.led)} />
    </>
  )
}

function ServerArt({ id }: { id: string }) {
  const bays = [0, 1, 2, 3]
  return (
    <>
      <rect x="12" y="8" width="96" height="62" rx="6" fill={`url(#${id}-case)`} style={{ stroke: hardware.caseEdge }} strokeWidth="0.8" />
      {bays.map((bay) => (
        <g key={bay}>
          <rect x={20 + bay * 19} y="16" width="15" height="46" rx="2" style={{ fill: hardware.bay, stroke: hardware.bayEdge }} strokeWidth="0.8" />
          <circle cx={27.5 + bay * 19} cy="56" r="1.4" style={fill(hardware.led)} />
        </g>
      ))}
      {[22, 30, 38].map((y) => (
        <circle key={y} cx="99" cy={y} r="1.4" style={fill(hardware.led)} opacity="0.8" />
      ))}
    </>
  )
}

// Used when a device never reported its type.
function GenericArt({ id }: { id: string }) {
  return (
    <>
      <rect x="20" y="6" width="80" height="54" rx="3" style={fill(hardware.frame)} stroke={`url(#${id}-silver)`} strokeWidth="1.5" />
      <Screen x={24} y={10} width={72} height={46} id={id} />
      <rect x="56" y="60" width="8" height="9" fill={`url(#${id}-silver)`} />
      <rect x="45" y="68" width="30" height="4" rx="2" fill={`url(#${id}-silver)`} />
    </>
  )
}

const artByType = {
  laptop: LaptopArt,
  desktop: DesktopArt,
  server: ServerArt,
} satisfies Record<DeviceType, (props: { id: string }) => React.JSX.Element>

interface DeviceArtProps {
  deviceType: DeviceType | null
  width: number
}

// Illustrated device with a soft blue backglow; the glow lives in DeviceGraph.css.
export default function DeviceArt({ deviceType, width }: DeviceArtProps) {
  const id = `art${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const Art = deviceType ? artByType[deviceType] : GenericArt
  return (
    <span className="device-art">
      <svg viewBox="0 0 120 76" width={width} aria-hidden="true">
        <Gradients id={id} />
        <Art id={id} />
      </svg>
    </span>
  )
}
