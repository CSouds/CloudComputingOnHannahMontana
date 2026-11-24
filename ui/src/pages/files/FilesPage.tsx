import { useSearchParams } from 'react-router'

// Retain the requested source while the actual directory browser is still being built.
export default function FilesPage() {
  const [params] = useSearchParams()
  const device = params.get('device')
  const file = params.get('file')

  if (!device || !file) return <p>Files</p>

  return (
    <section aria-label="Transfer source">
      <h2>{device}</h2>
      <p>{file}</p>
      <p>Folder browsing is not available yet.</p>
    </section>
  )
}
