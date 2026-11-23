/// <reference types="vite/client" />

// Variables read from ui/.env.local; see .env.example.
interface ImportMetaEnv {
  readonly VITE_BACKEND_URL?: string
  readonly VITE_DEVICE_TOKEN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
