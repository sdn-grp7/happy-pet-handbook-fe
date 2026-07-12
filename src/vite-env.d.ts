/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOONG_MAP_TILES_KEY: string;
  readonly VITE_GOONG_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
