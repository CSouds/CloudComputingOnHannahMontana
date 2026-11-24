import {
  File, FileArchive, FileBraces, FileChartColumn, FileCode, FileImage,
  FileMusic, FilePlay, FileText, FolderClosed, type LucideIcon,
} from 'lucide-react'

// Keep the agreed file categories together so new extensions use the same visual language.
const fileCategories: { extensions: string[]; icon: LucideIcon }[] = [
  { extensions: ['pdf', 'md'], icon: FileText },
  { extensions: ['zip'], icon: FileArchive },
  { extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tif', 'tiff', 'avif', 'heic', 'heif'], icon: FileImage },
  { extensions: ['mp4', 'm4v', 'mov', 'avi', 'mkv', 'webm', 'mpeg', 'mpg', 'wmv'], icon: FilePlay },
  { extensions: ['mp3', 'wav', 'flac', 'aac', 'm4a', 'ogg', 'opus', 'aiff', 'wma'], icon: FileMusic },
  { extensions: ['c', 'h', 'cpp', 'cc', 'cxx', 'hpp', 'cs', 'java', 'js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs', 'py', 'rb', 'go', 'rs', 'php', 'swift', 'kt', 'kts', 'html', 'css', 'scss', 'sass', 'less', 'vue', 'svelte', 'sh', 'bash', 'zsh', 'ps1', 'sql', 'r', 'lua'], icon: FileCode },
  { extensions: ['json', 'jsonc', 'jsonl'], icon: FileBraces },
  { extensions: ['xls', 'xlsx', 'xlsm', 'xlsb', 'ods', 'csv', 'tsv'], icon: FileChartColumn },
]

// Use the filename's extension, regardless of case, and show a plain file for anything unknown.
export default function getTransferIcon(name: string, type: string): LucideIcon {
  if (type === 'folder') return FolderClosed
  const dot = name.lastIndexOf('.')
  const extension = dot > 0 ? name.slice(dot + 1).toLowerCase() : ''
  return fileCategories.find((category) => category.extensions.includes(extension))?.icon ?? File
}
