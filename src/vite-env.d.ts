/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_ANTHROPIC_API_KEY: string
  readonly VITE_HERE_MAPS_API_KEY: string
  readonly VITE_GOOGLE_ROADS_API_KEY: string
  readonly VITE_OPENWEATHER_API_KEY: string
  readonly VITE_GOOGLE_OAUTH_CLIENT_ID: string
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
