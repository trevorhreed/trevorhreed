import { sep } from 'path'
import * as util from 'util'
import { isAbsolute, normalize, join, resolve, sep } from 'path'

export const noop = async () => { }

export const debug = obj => {
  console.log(util.inspect(obj, false, Infinity, true))
}

export const isHidden = (root, path) => {
  path = path.slice(root.length).split(sep)
  for (let segment of path) {
    if (segment[0] === '.') return true
  }
  return false
}

export const decode = path => {
  try {
    return decodeURIComponent(path)
  } catch (err) {
    return null
  }
}

export const resolveSafe = (root, path) => {
  if (arguments.length === 1) {
    path = root
    root = process.cwd()
  }

  if (typeof root !== 'string') {
    throw new Error(`safeResolve: 'root' parameter must be of type 'string'.`)
  }

  if (typeof path !== 'string') {
    throw new Error(`safeResolve: 'path' parameter must be of type 'string'.`)
  }

  if (path.indexOf('\0') !== -1) {
    throw new Error(`safeResolve: found '\\0' in path parameter: '${path}'.`)
  }

  if (isAbsolute(path)) {
    throw new Error(`safeResolve: path cannot be absolute: '${path}'.`)
  }

  if (normalize(join('.', path)).startsWith('../')) {
    throw new Error(`safeResolve: path cannot resolve above root: '${path}'.`)
  }

  return normalize(join(resolve(root), path))
}
