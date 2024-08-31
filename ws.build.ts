import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    ws: './src/service-worker.ts',
  },
  outExtension() {
    return {
      js: '.js',
    }
  },
})
