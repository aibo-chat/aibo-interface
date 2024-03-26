import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import { wasm } from '@rollup/plugin-wasm'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'

const copyFiles = {
  targets: [
    {
      src: 'node_modules/@matrix-org/olm/olm.wasm',
      dest: '',
    },
    {
      src: 'node_modules/pdfjs-dist/build/pdf.worker.min.js',
      dest: '',
    },
    {
      src: '_redirects',
      dest: '',
    },
    {
      src: 'config.json',
      dest: '',
    },
    {
      src: 'public/manifest.json',
      dest: '',
    },
    {
      src: 'public/res/android',
      dest: 'public/',
    },
  ],
}

export default defineConfig({
  appType: 'spa',
  publicDir: false,
  base: '',
  server: {
    port: 8080,
    host: true,
  },
  plugins: [
    nodePolyfills({
      exclude: [],
      protocolImports: true,
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      overrides: {
        fs: 'memfs',
      },
    }), // 添加这行
    viteStaticCopy(copyFiles),
    vanillaExtractPlugin(),
    wasm(),
    react(),
    svgr(),
    {
      name: 'prevent-base64',
      enforce: 'pre',
      apply: 'build',
      load(id) {
        const relativePath = path.relative(__dirname, id)
        if (relativePath.startsWith('public\\res\\json\\images')) {
          return null
        }
      },
    },
  ],
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    copyPublicDir: false,
    manifest: true,
  },
})
