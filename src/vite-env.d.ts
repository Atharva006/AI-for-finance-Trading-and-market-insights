/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_UPSTOX_ACCESS_TOKEN?: string;
  readonly VITE_UPSTOX_API_KEY?: string;
  readonly VITE_UPSTOX_API_SECRET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
