import fs from 'fs/promises'
import path from 'path'
import { glob, globSync } from 'glob'
import sharp from 'sharp'
import yaml from 'js-yaml'
import { minimatch } from 'minimatch'

const IMAGES_DIR = 'src/images'
const CONFIG_FILE = path.join(IMAGES_DIR, 'images.config.yaml')

function loadConfig(configPath) {
  return fs.readFile(configPath, 'utf-8').then(content => yaml.load(content))
}

function getConfigSizes(relativePath, config) {
  for (const [pattern, sizes] of Object.entries(config)) {
    if (pattern === 'defaults') continue
    if (minimatch(relativePath, pattern)) return sizes
  }
  return config.defaults || []
}

function parseSizesAttr(sizesAttr) {
  const widths = []
  const parts = sizesAttr.split(',').map(s => s.trim())
  for (const part of parts) {
    // Strip media condition in parens, then extract the size value
    const sizeValue = part.replace(/\(.*?\)\s*/, '').trim()
    const match = sizeValue.match(/(\d+)px/)
    if (match) widths.push(parseInt(match[1]))
  }
  return [...new Set(widths)].sort((a, b) => a - b)
}

function extractHtmlImages(html) {
  const images = []
  const imgRegex = /<img\b[^>]*>/gi
  let match
  while ((match = imgRegex.exec(html)) !== null) {
    const tag = match[0]
    const srcMatch = tag.match(/\bsrc=["']([^"']+)["']/)
    const sizesMatch = tag.match(/\bsizes=["']([^"']+)["']/)
    if (srcMatch && sizesMatch && srcMatch[1].startsWith('/images/')) {
      images.push({
        tag,
        src: srcMatch[1],
        sizes: sizesMatch[1],
        widths: parseSizesAttr(sizesMatch[1]),
      })
    }
  }
  return images
}

function resolveSourceFile(imgSrc) {
  const relative = imgSrc.replace(/^\/images\//, '')
  return path.join(IMAGES_DIR, relative)
}

function outputName(imgSrc, width) {
  const relative = imgSrc.replace(/^\/images\//, '')
  const ext = path.extname(relative)
  const base = relative.slice(0, -ext.length)
  return `images/${base}_${width}${ext}`
}

function outputUrl(imgSrc, width) {
  return '/' + outputName(imgSrc, width)
}

function rewriteImgTag(img) {
  const srcset = img.widths
    .map(w => `${outputUrl(img.src, w)} ${w}w`)
    .join(', ')
  const largest = Math.max(...img.widths)
  const newSrc = outputUrl(img.src, largest)

  let newTag = img.tag
  newTag = newTag.replace(/\bsrc=["'][^"']+["']/, `src="${newSrc}"`)
  newTag = newTag.replace(/\/?>$/, ` srcset="${srcset}"$&`)
  return newTag
}

async function generateImage(filePath, width) {
  return sharp(filePath).resize(width).toBuffer()
}

export default function imageResize() {
  const generated = new Map()

  async function generateConfigImages() {
    const config = await loadConfig(CONFIG_FILE)
    const files = await glob(`${IMAGES_DIR}/**/*.{jpg,jpeg,png,webp}`, {
      ignore: CONFIG_FILE,
    })

    await Promise.all(files.map(async file => {
      const relative = path.relative(IMAGES_DIR, file)
      const sizes = getConfigSizes(relative, config)
      if (sizes.length === 0) return

      await Promise.all(sizes.map(async width => {
        const name = `images/${relative.slice(0, -path.extname(relative).length)}_${width}${path.extname(relative)}`
        const buffer = await generateImage(file, width)
        generated.set(name, buffer)
      }))

      console.log(`  resized: ${relative} → [${sizes.join(', ')}]`)
    }))
  }

  async function generateHtmlImages(htmlFiles) {
    const allImages = []

    for (const htmlFile of htmlFiles) {
      const html = await fs.readFile(htmlFile, 'utf-8')
      allImages.push(...extractHtmlImages(html))
    }

    await Promise.all(allImages.map(async img => {
      const sourceFile = resolveSourceFile(img.src)
      await Promise.all(img.widths.map(async width => {
        const name = outputName(img.src, width)
        if (!generated.has(name)) {
          const buffer = await generateImage(sourceFile, width)
          generated.set(name, buffer)
        }
      }))
      console.log(`  resized (html): ${img.src} → [${img.widths.join(', ')}]`)
    }))
  }

  return {
    name: 'image-resize',

    async buildStart() {
      const htmlFiles = globSync('src/site/**/index.html')
      await Promise.all([
        generateConfigImages(),
        generateHtmlImages(htmlFiles),
      ])

      for (const [name, buffer] of generated) {
        this.emitFile({
          type: 'asset',
          fileName: name,
          source: buffer,
        })
      }
    },

    transformIndexHtml(html) {
      const images = extractHtmlImages(html)
      if (images.length === 0) return html

      for (const img of images) {
        html = html.replace(img.tag, rewriteImgTag(img))
      }
      return html
    },

    configureServer(server) {
      const htmlFiles = globSync('src/site/**/index.html')
      Promise.all([
        generateConfigImages(),
        generateHtmlImages(htmlFiles),
      ])

      server.watcher.add([IMAGES_DIR])
      server.watcher.on('change', async filePath => {
        if (!filePath.startsWith(IMAGES_DIR) || filePath === CONFIG_FILE) return
        const config = await loadConfig(CONFIG_FILE)
        const relative = path.relative(IMAGES_DIR, filePath)
        const sizes = getConfigSizes(relative, config)
        if (sizes.length === 0) return
        await Promise.all(sizes.map(async width => {
          const ext = path.extname(relative)
          const base = relative.slice(0, -ext.length)
          const name = `images/${base}_${width}${ext}`
          const buffer = await generateImage(filePath, width)
          generated.set(name, buffer)
        }))
        console.log(`  resized: ${relative} → [${sizes.join(', ')}]`)
      })

      return () => {
        server.middlewares.use((req, res, next) => {
          const url = req.url?.split('?')[0]?.slice(1)
          if (url && generated.has(url)) {
            const buffer = generated.get(url)
            const ext = path.extname(url)
            const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg'
            res.setHeader('Content-Type', mime)
            res.end(buffer)
            return
          }
          next()
        })
      }
    },
  }
}
