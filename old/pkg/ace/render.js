import * as fs from 'fs'
import { normalize, resolve, parse } from 'path'
import * as util from 'util'
import { resolveSafe, decode, isHidden } from './utils.js'

const readFile = util.promisify(fs.readFile)

const renderString = (templateStr, context) => {

}

export const render = ({
  source = './'
} = {}) => {
  if (typeof source === 'string') {
    const root = normalize(resolve(source))
    source = async path => {
      path = path.slice(parse(path).root.length)
      path = decode(path)
      if (!path) throw 400
      path = resolveSafe(root, path)
      if (isHidden(root, path)) throw 404
      const data = await readFile(path)
      return data.toString()
    }
  }
  const render = (templatePath, context) => {
    const templateStr = source(templatePath)
    return renderString(templateStr, context)
  }
  return (ctx, next) => {
    ctx.renderString = renderString
    ctx.render = render
  }
}
