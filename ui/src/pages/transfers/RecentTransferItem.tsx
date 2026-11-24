import { ArrowRight, CircleCheck, Folder } from 'lucide-react'
import { Link } from 'react-router'
import type { CompletedTransfer } from '../../services/transfers'
import getTransferIcon from './getTransferIcon'

// Completed transfers stay readable like queue rows, with navigation instead of reorder or cancel actions.
export default function RecentTransferItem({ item }: { item: CompletedTransfer }) {
  const FileIcon = getTransferIcon(item.name, item.type)

  return (
    <li className="recent-transfer-item">
      <FileIcon size={34} strokeWidth={1.5} aria-hidden="true" />
      <div className="recent-transfer-details">
        <span className="recent-transfer-name" title={item.name}>{item.name}</span>
        <span className="recent-transfer-route">
          <span>{item.source}</span>
          <ArrowRight size={16} aria-label="to" />
          <span>{item.destination}</span>
        </span>
      </div>
      <span className="recent-transfer-size">{item.size}</span>
      <span className="recent-transfer-completed" role="img" aria-label="Completed">
        <CircleCheck size={22} aria-hidden="true" />
      </span>
      <Link className="recent-transfer-files" to="/files" aria-label={`Go to Files after ${item.name}`}>
        <Folder size={16} aria-hidden="true" /> Go to Files
      </Link>
    </li>
  )
}
