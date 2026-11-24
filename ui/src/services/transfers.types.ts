// Share the queue contract between service implementations and UI without importing components.
export interface TransferFile {
  id: string
  name: string
  type: string
  size: string
  source: string
  destination: string
}

// Waiting and completed transfers use the same file details, with completion recorded for history.
export type QueuedTransfer = TransferFile

export interface CompletedTransfer extends TransferFile {
  completedAt: string
}
