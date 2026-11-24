import RecentTransfers from './RecentTransfers'

// Give the Home history link a complete list of completed transfers to open.
export default function TransfersPage() {
  return <RecentTransfers preview={false} />
}
