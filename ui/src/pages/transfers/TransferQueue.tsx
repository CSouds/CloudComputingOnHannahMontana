import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { startQueuedTransfer, cancelQueuedTransfer, changeQueueOrder, getQueue, type QueuedTransfer } from '../../services/transfers'
import TransferQueueItem from './TransferQueueItem'
import RecentTransfers from './RecentTransfers'
import './TransferQueue.css'

// Measure actual row heights so wrapped routes displace their neighbors by the correct distance.
interface QueueDrag {
  id: string
  from: number
  to: number
  pointerOffset: number
  scale: number
  rows: { top: number; height: number }[]
}

// Display service snapshots so switching from mocks to the agent never changes the rows.
export default function TransferQueue() {
  const [items, setItems] = useState<QueuedTransfer[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isChanging, setIsChanging] = useState(false)
  const [drag, setDrag] = useState<QueueDrag | null>(null)
  const [expanded, setExpanded] = useState(false)
  const listId = useId()
  const dragRef = useRef<QueueDrag | null>(null)
  const pointerRef = useRef<{ x: number; y: number } | null>(null)
  const listRef = useRef<HTMLOListElement>(null)
  const changeInFlight = useRef(false)
  // Home starts with a short preview; expanding reveals the same queue in place.
  const visibleItems = items ? expanded ? items : items.slice(0, 3) : []
  const hiddenCount = (items?.length ?? 0) - visibleItems.length

  // Discard the preview order on canceled or outside drops without changing the service queue.
  const clearDrag = useCallback(() => {
    dragRef.current = null
    pointerRef.current = null
    setDrag(null)
  }, [])

  // Freeze the original slots so moving rows cannot repeatedly change their own hover targets.
  function beginDrag(id: string, pointerY: number) {
    const list = listRef.current
    const from = items?.findIndex((item) => item.id === id) ?? -1
    if (!list || from < 0) return
    const top = list.getBoundingClientRect().top
    const rows = Array.from(list.children, (row) => {
      const bounds = row.getBoundingClientRect()
      return { top: bounds.top - top, height: bounds.height }
    })
    // Slot measurements are screen pixels; neighbor transforms need the unscaled layout distance.
    const scale = list.getBoundingClientRect().width / Number.parseFloat(getComputedStyle(list).width)
    const session = { id, from, to: from, rows, scale, pointerOffset: pointerY - top - rows[from].top - rows[from].height / 2 }
    dragRef.current = session
    setDrag(session)
  }

  // Open the nearest slot as the pointer moves, accounting for scrolling during the drag.
  function previewOrder(x: number, pointerY: number) {
    const session = dragRef.current
    const list = listRef.current
    if (!session || !list || changeInFlight.current) return
    pointerRef.current = { x, y: pointerY }
    const bounds = list.getBoundingClientRect()
    const viewport = list.closest('main')?.getBoundingClientRect() ?? bounds
    const inside = x >= bounds.left && x <= bounds.right
      && pointerY >= Math.max(bounds.top, viewport.top) && pointerY <= Math.min(bounds.bottom, viewport.bottom)
    const y = pointerY - bounds.top - session.pointerOffset
    let to = session.from
    if (inside) {
      for (let index = 0; index < session.rows.length; index++) {
        const center = session.rows[index].top + session.rows[index].height / 2
        const closestCenter = session.rows[to].top + session.rows[to].height / 2
        if (Math.abs(y - center) < Math.abs(y - closestCenter)) to = index
      }
    }
    if (to !== session.to) {
      dragRef.current = { ...session, to }
      setDrag(dragRef.current)
    }
  }

  // Keep long queues reachable while holding a row near the visible content's top or bottom edge.
  const isDragging = drag !== null
  useEffect(() => {
    if (!isDragging) return
    let frame = 0
    let previousTime = 0
    function scrollWhileDragging(time: number) {
      const list = listRef.current
      const scroller = list?.closest('main')
      const pointer = pointerRef.current
      if (scroller && pointer) {
        const bounds = scroller.getBoundingClientRect()
        const edge = 56
        const speed = pointer.y < bounds.top + edge
          ? -Math.min(1, (bounds.top + edge - pointer.y) / edge)
          : pointer.y > bounds.bottom - edge ? Math.min(1, (pointer.y - bounds.bottom + edge) / edge) : 0
        const elapsed = previousTime ? Math.min(time - previousTime, 32) : 16
        if (speed && pointer.x >= bounds.left && pointer.x <= bounds.right) {
          scroller.scrollTop += speed * elapsed * 0.65
          previewOrder(pointer.x, pointer.y)
        }
      }
      previousTime = time
      frame = requestAnimationFrame(scrollWhileDragging)
    }
    frame = requestAnimationFrame(scrollWhileDragging)
    return () => cancelAnimationFrame(frame)
  }, [isDragging])

  // Shift neighbors into their future slots while retaining a stable DOM for pointer capture.
  function rowOffset(index: number): number {
    if (!drag) return 0
    const source = drag.rows[drag.from]
    if (index === drag.from) {
      const target = drag.rows[drag.to]
      return drag.to > drag.from
        ? target.top + target.height - source.top - source.height
        : target.top - source.top
    }
    if (drag.to > drag.from && index > drag.from && index <= drag.to) return -source.height
    if (drag.to < drag.from && index >= drag.to && index < drag.from) return source.height
    return 0
  }

  // Commit once on drop; hover previews never issue service calls.
  function dropItem(x: number, y: number) {
    previewOrder(x, y)
    const session = dragRef.current
    if (!session || changeInFlight.current || !items) return
    if (session.from !== session.to) {
      const targetId = items[session.to].id
      void updateQueue(() => changeQueueOrder(session.id, targetId))
    }
    clearDrag()
  }

  // Load through the asynchronous contract now so a later HTTP implementation needs no UI rewrite.
  useEffect(() => {
    const controller = new AbortController()

    async function loadQueue() {
      try {
        const queue = await getQueue(controller.signal)
        if (!controller.signal.aborted) setItems(queue)
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Could not load the transfer queue.')
        }
      }
    }

    void loadQueue()
    return () => controller.abort()
  }, [])

  // Wait for each accepted change so slower responses cannot overwrite a newer queue order.
  async function updateQueue(change: () => Promise<QueuedTransfer[]>) {
    if (changeInFlight.current) return
    changeInFlight.current = true
    setIsChanging(true)
    setError(null)
    try {
      setItems(await change())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update the transfer queue.')
    } finally {
      changeInFlight.current = false
      setIsChanging(false)
    }
  }

  // An idle queue gives Home room for recent copies, or a small invitation to start one.
  if (items?.length === 0) return <RecentTransfers />

  return (
    <section className="transfer-queue" aria-label="Transfer queue" aria-busy={isChanging}>
      {/* Keep the queue count in sync with the latest service snapshot. */}
      <div className="transfer-queue-header">
        <h2>Up next</h2>
        <span className="transfer-queue-count" aria-live="polite" aria-atomic="true">
          {items !== null && `${items.length} queued`}
        </span>
      </div>
      {error && <p role="alert">{error}</p>}
      {items === null ? (
        !error && <p className="transfer-queue-empty" role="status">Loading queue…</p>
      ) : (
        <>
        <ol
          id={listId}
          ref={listRef}
          className={`transfer-queue-list${drag ? ' transfer-queue-list--reordering' : ''}`}
        >
          {visibleItems.map((item, index) => (
            <TransferQueueItem
              key={item.id}
              item={item}
              disabled={isChanging}
              isDragging={drag?.id === item.id}
              offset={rowOffset(index) / (drag?.scale ?? 1)}
              onStart={() => void updateQueue(() => startQueuedTransfer(item.id))}
              onCancel={() => void updateQueue(() => cancelQueuedTransfer(item.id))}
              onMove={(direction) => {
                const neighbor = visibleItems[index + direction]
                if (neighbor) void updateQueue(() => changeQueueOrder(item.id, neighbor.id))
              }}
              onDragStart={(pointerY) => beginDrag(item.id, pointerY)}
              onDragMove={previewOrder}
              onDrop={dropItem}
              onDragEnd={clearDrag}
            />
          ))}
        </ol>
        {/* Reveal remaining files on Home instead of navigating away from the queue. */}
        {items.length > 3 && (
          <button
            type="button"
            className="transfer-queue-show-more"
            aria-expanded={expanded}
            aria-controls={listId}
            disabled={isChanging || isDragging}
            onClick={() => setExpanded((current) => !current)}
          >
            {expanded ? 'Show fewer' : `Show ${hiddenCount} more`}
          </button>
        )}
        </>
      )}
    </section>
  )
}
