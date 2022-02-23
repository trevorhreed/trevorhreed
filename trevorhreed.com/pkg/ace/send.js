import * as fs from 'fs'
import { extname, normalize, resolve, parse } from 'path'
import * as util from 'util'
import { resolveSafe, decode, isHidden } from './utils.js'

const stat = util.promisify(fs.stat)

const NOT_FOUND = ['ENOENT', 'ENAMETOOLONG', 'ENOTDIR']

export const send = ({
  root = './',
  prefix = '',
  index = 'index.html',
  autoTrailingSlash = true,
  maxage = 0
} = {}) => {
  return async (ctx, next) => {
    if (
      !ctx.path.startsWith(prefix)
      || (
        ctx.method !== 'HEAD'
        && ctx.method !== 'GET'
      )
    ) return next()

    let path = ctx.path.slice(prefix.length)

    root = normalize(resolve(root))
    const trailingSlash = path[path.length - 1] === '/'
    path = path.slice(parse(path).root.length)

    path = decode(path)

    if (path === null) throw 400
    if (index && trailingSlash) path += index

    path = resolveSafe(root, path)

    if (isHidden(root, path)) return next()

    let stats
    try {
      stats = await stat(path)
      if (stats.isDirectory()) {
        if (autoTrailingSlash && index) {
          path += `/${index}`
          stats = await stat(path)
        } else {
          return next()
        }
      }
    } catch (err) {
      if (NOT_FOUND.includes(err.code)) {
        throw 404
      }
      throw 500
    }

    ctx.setIfEmpty('Content-Length', stats.size)
    ctx.setIfEmpty('Last-Modified', stats.mtime.toUTCString())
    ctx.setIfEmpty('Cache-Control', `max-age=${maxage}`)

    if (!ctx.type) ctx.type = extname(path)
    ctx.body = fs.createReadStream(path)
  }
}
