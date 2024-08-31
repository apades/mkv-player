/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<object, object, any>
  export default component
}

/// <reference lib="WebWorker" />

// export empty type because of tsc --isolatedModules flag
export type {}
declare const self: ServiceWorkerGlobalScope
