import fs from 'fs/promises'
import path from 'path'
import { glob } from 'glob'
import yaml from 'js-yaml'
import { pathToFileURL } from 'url'

const DATA_DIR = 'src/data'

async function runScript(scriptPath) {
  const resolved = path.resolve(scriptPath)
  const mod = await import(pathToFileURL(resolved).href)
  return mod.default()
}

async function applyTransforms(data, transforms) {
  const chain = Array.isArray(transforms) ? transforms : [transforms]
  let result = data
  for (const transformPath of chain) {
    const resolved = path.resolve(transformPath)
    const mod = await import(pathToFileURL(resolved).href)
    result = await mod.default(result)
  }
  return result
}

function getOutputName(filePath) {
  const relative = path.relative(DATA_DIR, filePath)
  const ext = path.extname(relative)
  return 'data/' + relative.slice(0, -ext.length) + '.json'
}

async function processFile(filePath) {
  const raw = await fs.readFile(filePath, 'utf-8')
  const config = yaml.load(raw) || {}

  let data
  if (config.script) {
    data = await runScript(config.script)
  } else {
    data = config.data
  }

  if (data != null && config.transforms) {
    data = await applyTransforms(data, config.transforms)
  }

  const outputName = getOutputName(filePath)
  const content = JSON.stringify(data, null, 2)
  console.log(`  data: ${path.relative(DATA_DIR, filePath)} → ${outputName}`)
  return { outputName, content }
}

export default function dataPipeline() {
  const generated = new Map()

  return {
    name: 'data-pipeline',

    async buildStart() {
      const files = await glob(`${DATA_DIR}/**/*.{yaml,yml}`)
      const results = await Promise.all(files.map(processFile))
      for (const { outputName, content } of results) {
        this.emitFile({
          type: 'asset',
          fileName: outputName,
          source: content,
        })
      }
    },

    configureServer(server) {
      (async () => {
        const files = await glob(`${DATA_DIR}/**/*.{yaml,yml}`)
        const results = await Promise.all(files.map(processFile))
        for (const { outputName, content } of results) {
          generated.set(outputName, content)
        }
      })()

      server.watcher.add([DATA_DIR])
      server.watcher.on('change', async filePath => {
        if (!filePath.startsWith(DATA_DIR)) return
        const { outputName, content } = await processFile(filePath)
        generated.set(outputName, content)
      })

      return () => {
        server.middlewares.use((req, res, next) => {
          const url = req.url?.split('?')[0]?.slice(1)
          if (url && generated.has(url)) {
            res.setHeader('Content-Type', 'application/json')
            res.end(generated.get(url))
            return
          }
          next()
        })
      }
    },
  }
}
