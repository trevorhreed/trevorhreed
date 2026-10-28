import { resolve } from 'path'
import { globSync } from 'glob'
import { defineConfig } from 'vite'
import imageResize from './plugins/image-resize.js'
import dataPipeline from './plugins/data-pipeline.js'

const pages = Object.fromEntries(
  globSync('src/site/**/index.html').map(file => {
    const name = file.replace('src/site/', '').replace('/index.html', '') || 'main'
    return [name, resolve(__dirname, file)]
  })
)

export default defineConfig({
  root: resolve(__dirname, 'src/site'),
  publicDir: resolve(__dirname, 'src/public'),
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    target: 'esnext',
    rollupOptions: {
      input: pages,
    },
  },
  plugins: [
    imageResize(),
    dataPipeline(),
  ],
})
