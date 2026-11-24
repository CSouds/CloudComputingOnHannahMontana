import queueData from './Queue.json'
import recentData from './RecentTransfers.json'
import type { CompletedTransfer, QueuedTransfer } from '../transfers.types'

// Keep mock state outside React so navigating away does not reset canceled or reordered items.
let queue: QueuedTransfer[] = [...queueData].sort((a, b) => a.priority - b.priority)

// Return detached snapshots so UI edits cannot silently change the service's queue.
export async function getQueue(signal?: AbortSignal): Promise<QueuedTransfer[]> {
  signal?.throwIfAborted()
  return queue.map((item) => ({ ...item }))
}

// History contains completed copies only; canceling a waiting item never adds a successful transfer.
export async function getRecentTransfers(signal?: AbortSignal): Promise<CompletedTransfer[]> {
  signal?.throwIfAborted()
  return recentData.map((item) => ({ ...item }))
    .sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt))
}

// Move one waiting file to another row's position, just as the future agent will do.
export async function changeQueueOrder(id: string, targetId: string): Promise<QueuedTransfer[]> {
  const from = queue.findIndex((item) => item.id === id)
  const to = queue.findIndex((item) => item.id === targetId)
  if (from < 0 || to < 0) throw new Error('This transfer is no longer in the queue.')
  const reordered = [...queue]
  const [item] = reordered.splice(from, 1)
  reordered.splice(to, 0, item)
  queue = reordered
  return getQueue()
}

// Treat repeated cancellation as successful so retrying a request is harmless.
export async function cancelQueuedTransfer(id: string): Promise<QueuedTransfer[]> {
  queue = queue.filter((item) => item.id !== id)
  return getQueue()
}

// Retain the selected job across navigation so the active transfer bar stays in sync.
let activeTransfer: QueuedTransfer | null = null
const activeListeners = new Set<() => void>()

// Return a stable snapshot for views subscribed to the active job.
export function getActiveTransfer(): QueuedTransfer | null {
  return activeTransfer
}

// Let mounted views refresh when a different transfer is selected.
export function subscribeActiveTransfer(listener: () => void): () => void {
  activeListeners.add(listener)
  return () => { activeListeners.delete(listener) }
}

// Start the chosen file now and keep any interrupted job first in the waiting queue.
export async function startQueuedTransfer(id: string): Promise<QueuedTransfer[]> {
  const item = queue.find((transfer) => transfer.id === id)
  if (!item) throw new Error('This transfer is no longer in the queue.')
  queue = queue.filter((transfer) => transfer.id !== id)
  if (activeTransfer) queue.unshift(activeTransfer)
  activeTransfer = item
  activeListeners.forEach((listener) => listener())
  return getQueue()
}
