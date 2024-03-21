import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import { wasm } from '@rollup/plugin-wasm'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import inject from '@rollup/plugin-inject'

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
  plugins: [viteStaticCopy(copyFiles), vanillaExtractPlugin(), wasm(), react(), svgr()],
  resolve: {
    alias: {
      process: 'process/browser',
      stream: 'stream-browserify',
      zlib: 'browserify-zlib',
      util: 'util',
      buffer: 'rollup-plugin-node-polyfills/polyfills/buffer-es6', // add buffer
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
      plugins: [
        // Enable esbuild polyfill plugins
        NodeGlobalsPolyfillPlugin({
          process: false,
          buffer: true,
        }),
      ],
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    copyPublicDir: false,
    manifest: true,
    rollupOptions: {
      plugins: [inject({ Buffer: ['buffer', 'Buffer'], Buffer2: ['Buffer', 'Buffer'] })],
    },
  },
})
