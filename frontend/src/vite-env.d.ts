/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLICKUP_API_TOKEN?: string;
  readonly VITE_USER_EMAIL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}