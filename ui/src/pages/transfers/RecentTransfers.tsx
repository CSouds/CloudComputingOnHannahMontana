import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { getRecentTransfers, type CompletedTransfer } from '../../services/transfers'
import RecentTransferItem from './RecentTransferItem'
import './RecentTransfers.css'

// Home previews three completed copies; the history route can display the full service result.
export default function RecentTransfers({ preview = true }: { preview?: boolean }) {
  const [items, setItems] = useState<CompletedTransfer[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Keep history transport behind the service boundary, including cancellation on navigation.
  useEffect(() => {
    const controller = new AbortController()
    async function loadHistory() {
      try {
        const history = await getRecentTransfers(controller.signal)
        if (!controller.signal.aborted) setItems(history)
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Could not load recent transfers.')
        }
      }
    }
    void loadHistory()
    return () => controller.abort()
  }, [])

  const visibleItems = preview ? items?.slice(0, 3) : items

  return (
    <section className={`recent-transfers${preview ? '' : ' recent-transfers--history'}`} aria-label="Recent transfers">
      {items?.length === 0 ? (
        <p className="recent-transfers-empty">
          No transfers yet. <Link to="/files">Go to Files</Link> to start a transfer.
        </p>
      ) : (
        <>
          <div className="recent-transfers-header">
            <h2>{preview ? 'Recent transfers' : 'Transfer history'}</h2>
            {preview && Boolean(items?.length) && (
              <Link className="recent-transfers-history-link" to="/transfers">
                View history <ArrowRight size={18} aria-hidden="true" />
              </Link>
            )}
          </div>
          {error && <p role="alert">{error}</p>}
          {!items && !error && <p className="recent-transfers-empty" role="status">Loading recent transfers…</p>}
          {visibleItems && (
            <ul className="recent-transfers-list">
              {visibleItems.map((item) => <RecentTransferItem key={item.id} item={item} />)}
            </ul>
          )}
        </>
      )}
    </section>
  )
}
