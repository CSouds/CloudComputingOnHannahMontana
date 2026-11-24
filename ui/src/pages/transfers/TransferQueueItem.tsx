import { ArrowRight, Play, Ellipsis, Folder, Trash2 } from 'lucide-react'
import { useEffect, useId, useRef, useState, type PointerEvent } from 'react'
import { createSearchParams, Link } from 'react-router'
import getTransferIcon from './getTransferIcon'
import type { QueuedTransfer } from '../../services/transfers'

interface TransferQueueItemProps {
  item: QueuedTransfer
  disabled: boolean
  isDragging: boolean
  offset: number
  onStart: () => void
  onCancel: () => void
  onMove: (direction: -1 | 1) => void
  onDragStart: (pointerY: number) => void
  onDragMove: (pointerX: number, pointerY: number) => void
  onDrop: (pointerX: number, pointerY: number) => void
  onDragEnd: () => void
}

// Present one waiting file while letting the parent own all queue changes.
export default function TransferQueueItem({
  item, disabled, isDragging, offset, onCancel, onStart, onMove,
  onDragStart, onDragMove, onDrop, onDragEnd,
}: TransferQueueItemProps) {
  const FileIcon = getTransferIcon(item.name, item.type)
  const menuId = useId()
  const menuRef = useRef<HTMLDivElement>(null)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  // Preserve source context until Files can resolve real folder paths from the agent.
  const sourceUrl = `/files?${createSearchParams({ device: item.source, file: item.name })}`
  const rowRef = useRef<HTMLLIElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLLIElement | null>(null)
  const pointerRef = useRef<{
    id: number; x: number; y: number; bounds: DOMRect; active: boolean
  } | null>(null)

  // Escape and unmount must remove the floating row, including when no pointer-up arrives.
  useEffect(() => {
    function cancelOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && pointerRef.current) {
        event.preventDefault()
        endDrag()
      }
    }
    document.addEventListener('keydown', cancelOnEscape)
    return () => {
      document.removeEventListener('keydown', cancelOnEscape)
      if (previewRef.current) document.body.classList.remove('transfer-queue-reordering')
      previewRef.current?.remove()
    }
  }, [onDragEnd])

  // Pick up anywhere on the row while leaving cancel and future interactive controls clickable.
  function pickUp(event: PointerEvent<HTMLDivElement>) {
    const row = rowRef.current
    if (!row || disabled || event.button !== 0 || !event.isPrimary) return
    if ((event.target as Element).closest('button, a, input, select, textarea')) return
    event.preventDefault()
    // Pointer pickup should not leave the keyboard focus ring behind after release.
    event.currentTarget.blur()
    event.currentTarget.setPointerCapture(event.pointerId)
    pointerRef.current = {
      id: event.pointerId, x: event.clientX, y: event.clientY,
      bounds: row.getBoundingClientRect(), active: false,
    }
  }

  // Move a full-width floating copy after a small threshold so simple clicks do not reorder files.
  function movePointer(event: PointerEvent<HTMLDivElement>) {
    const pointer = pointerRef.current
    const row = rowRef.current
    if (!pointer || pointer.id !== event.pointerId || !row) return
    if (!pointer.active) {
      if (Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) < 5) return
      const preview = row.cloneNode(true) as HTMLLIElement
      preview.className = 'transfer-queue-item transfer-queue-drag-preview'
      preview.style.width = `${pointer.bounds.width}px`
      preview.setAttribute('aria-hidden', 'true')
      preview.inert = true
      previewRef.current = preview
      document.body.appendChild(preview)
      document.body.classList.add('transfer-queue-reordering')
      pointer.active = true
      onDragStart(pointer.y)
    }
    if (previewRef.current) {
      previewRef.current.style.transform = `translate(${event.clientX - pointer.x + pointer.bounds.left}px, ${event.clientY - pointer.y + pointer.bounds.top}px)`
    }
    onDragMove(event.clientX, event.clientY)
  }

  // Successful drops commit once; canceled or lost pointers restore the original queue.
  function releasePointer(event: PointerEvent<HTMLDivElement>) {
    const pointer = pointerRef.current
    if (!pointer || pointer.id !== event.pointerId) return
    if (pointer.active) onDrop(event.clientX, event.clientY)
    endDrag()
  }

  // Clear capture state before releasing it so lost-capture events cannot commit another drop.
  function endDrag() {
    const pointer = pointerRef.current
    pointerRef.current = null
    const content = contentRef.current
    if (pointer && content?.hasPointerCapture(pointer.id)) content.releasePointerCapture(pointer.id)
    if (previewRef.current) document.body.classList.remove('transfer-queue-reordering')
    previewRef.current?.remove()
    previewRef.current = null
    onDragEnd()
  }

  return (
    <li
      ref={rowRef}
      className={`transfer-queue-item${isDragging ? ' transfer-queue-item--dragging' : ''}`}
    >
      {/* The complete row supports pointer pickup and focused arrow-key reordering. */}
      <div
        ref={contentRef}
        className="transfer-queue-item-content"
        style={{ transform: `translateY(${offset}px)` }}
        role="group"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-label={`Reorder ${item.name}. Use up and down arrow keys.`}
        title="Drag to reorder, or use up and down arrow keys"
        onPointerDown={pickUp}
        onPointerMove={movePointer}
        onPointerUp={releasePointer}
        onPointerCancel={endDrag}
        onLostPointerCapture={() => {
          if (pointerRef.current) endDrag()
        }}
        onKeyDown={(event) => {
          if (disabled || event.target !== event.currentTarget) return
          if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault()
            onMove(event.key === 'ArrowUp' ? -1 : 1)
          }
        }}
      >
      <FileIcon className="transfer-queue-file-icon" size={34} strokeWidth={1.5} aria-hidden="true" />
      <div className="transfer-queue-details">
        <span className="transfer-queue-name" title={item.name}>{item.name}</span>
        <span className="transfer-queue-route">
          <span>{item.source}</span>
          <ArrowRight size={16} aria-label="to" />
          <span>{item.destination}</span>
        </span>
      </div>
      <div className="transfer-queue-meta">
        <span className="transfer-queue-size">{item.size}</span>
      </div>
      {/* Keep actions together so narrow rows leave file details easy to read. */}
      <div className="transfer-queue-actions">
      <button
        type="button"
        className="transfer-queue-start"
        disabled={disabled}
        aria-label={`Start transfer of ${item.name} now`}
        title="Start now"
        onClick={onStart}
      >
        <Play size={18} strokeWidth={1.5} aria-hidden="true" />
      </button>
      {/* Native popovers dismiss with Escape or an outside click without interfering with row dragging. */}
      <button
        type="button"
        className="transfer-queue-more"
        disabled={disabled}
        aria-label={`More actions for ${item.name}`}
        popoverTarget={menuId}
        onClick={(event) => {
          // Keep actions inside the viewport even on the final visible queue row.
          const bounds = event.currentTarget.getBoundingClientRect()
          setMenuPosition({
            top: Math.max(8, Math.min(bounds.bottom + 6, window.innerHeight - 112)),
            left: Math.max(8, Math.min(bounds.right - 224, window.innerWidth - 232)),
          })
        }}
      >
        <Ellipsis size={22} aria-hidden="true" />
      </button>
      <div
        ref={menuRef}
        id={menuId}
        popover="auto"
        className="transfer-queue-menu"
        style={menuPosition}
        aria-label={`Actions for ${item.name}`}
      >
        <Link to={sourceUrl} onClick={() => menuRef.current?.hidePopover()}>
          <Folder size={16} aria-hidden="true" /> Show source in Files
        </Link>
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            // Remove only the waiting job; the source file remains untouched.
            menuRef.current?.hidePopover()
            onCancel()
          }}
        >
          <Trash2 size={16} aria-hidden="true" /> Remove from queue
        </button>
      </div>
      </div>
      </div>
    </li>
  )
}
