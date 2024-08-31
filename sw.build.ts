import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    sw: './src/service-worker.ts',
  },
  outExtension() {
    return {
      js: '.js',
    }
  },
})
