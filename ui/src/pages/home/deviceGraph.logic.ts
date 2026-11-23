// Wire geometry for the device graph, in real pixels.
//
// `sCurve` is adapted from T3 Code's environments map
// (apps/web/src/components/settings/environmentsMap.logic.ts), used under the MIT License:
// Copyright (c) 2026 T3 Tools Inc. https://github.com/pingdotgg/t3code

/** Straight to `fanX`, then a curve that arrives level at (x1, y1). */
export function sCurve(x0: number, y0: number, x1: number, y1: number, fanX = x0) {
  // A short run bends within itself, so it still arrives level instead of doubling back.
  const reach = Math.max(Math.min(24, (x1 - fanX) * 0.6), (x1 - fanX) / 2)
  const lead = fanX > x0 ? `H${fanX}` : ''
  return `M${x0} ${y0}${lead}C${fanX + reach} ${y0} ${x1 - reach} ${y1} ${x1} ${y1}`
}

/** The shared straight run every wire takes out of this device before branching. */
const TRUNK = 40
/** At least this much of the gap after the trunk goes to bending; the rest is straight. */
const BEND_SHARE = 0.5
/** A bend never gets narrower than its climb, so it stays an S instead of a cliff. */
const MIN_BEND_PER_CLIMB = 1
/** Every branch keeps at least this much straight run before it reaches its device. */
const MIN_STRAIGHT = 12

/**
 * One wire per peer, from this device (left middle) to the middle of the peer's row. Rows are
 * equal height, so each row's middle is simple math. All wires run forward together as one trunk,
 * then branch with an S-bend and run straight into their device. When space is tight, a branch
 * with a long climb borrows more of the gap so it doesn't turn into a cliff.
 */
export function wirePaths(width: number, height: number, count: number): string[] {
  const startY = height / 2
  const trunk = Math.min(TRUNK, width * 0.2)
  const room = Math.max(0, width - trunk - MIN_STRAIGHT)

  return Array.from({ length: count }, (_, index) => {
    const toY = ((index + 0.5) / count) * height
    const climb = Math.abs(toY - startY)
    const bend = Math.min(room, Math.max((width - trunk) * BEND_SHARE, climb * MIN_BEND_PER_CLIMB))
    return `${sCurve(0, startY, trunk + bend, toY, trunk)}H${width}`
  })
}
