import { INVALID_METHOD, INVALID_ROUTING_OBJECT } from './error.js'
import { Ware } from './ware.js'


export class Router {
  static #METHODS = ['HEAD', 'OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  #prefix
  #paramPrefix
  #enableSpec
  #routes = []

  constructor(config) {
    const {
      prefix = '',
      paramPrefix = ':',
      enableSpec = false
    } = config || {}
    this.#enableSpec = enableSpec
    this.#prefix = prefix
    this.#paramPrefix = paramPrefix
  }

  async run(ctx, next) {
    if (!ctx.path.startsWith(this.#prefix)) return next()
    const path = ctx.path
    ctx.path = path.slice(this.#prefix.length)
    if (this.#enableSpec && ctx.path === '/~spec') {
      return this.#getSpec()
    } else {
      const wares = this.#find(ctx)
      if (!wares) return next()
      await new Ware(wares).run(ctx, next)
    }
    ctx.path = path
  }

  use(ware) {
    // TODO...
  }

  head(path, ...handlers) { this.#method('HEAD', path, ...handlers) }
  options(path, ...handlers) { this.#method('OPTIONS', path, ...handlers) }
  get(path, ...handlers) { this.#method('GET', path, ...handlers) }
  post(path, ...handlers) { this.#method('POST', path, ...handlers) }
  put(path, ...handlers) { this.#method('PUT', path, ...handlers) }
  patch(path, ...handlers) { this.#method('PATCH', path, ...handlers) }
  delete(path, ...handlers) { this.#method('DELETE', path, ...handlers) }
  #method(method, path, fn) { this.routes({ route: `${method} ${path}`, fn }) }
  routes(routes) {
    routes = this.#transformRoutes(routes)
    this.#routes.push(...routes)
  }

  #splitOn = (str, on = ' ') => {
    const index = str.indexOf(on)
    if (index === -1) return [str]
    return [
      str.slice(0, index),
      str.slice(index + 1)
    ]
  }

  #transformRoutes(routes) {
    if (!routes) return
    if (!Array.isArray(routes)) routes = [routes]
    return routes.map(item => {
      const { use, children } = item
      const { route, fn } = item
      if (children) {
        item.type = 'group'
        item.prefix = '' + (item.prefix || '')
        item.use = Array.isArray(use) ? use : [use]
        item.children = this.#transformRoutes(children)
      } else if (route && fn) {
        item.type = 'route'
        let [method, path] = this.#splitOn(route)
        method = method.toUpperCase()
        if (!Router.#METHODS.includes(method)) {
          throw INVALID_METHOD(method, Router.#METHODS, route)
        }
        item.method = method
        item.pathSegments = path.split('/')
      } else {
        throw INVALID_ROUTING_OBJECT(item)
      }
      return item
    })
  }

  #find(ctx, routes = this.#routes) {
    for (let item of routes) {
      switch (item.type) {
        case 'group': {
          const { prefix, use, children } = item
          if (!ctx.path.startsWith(prefix)) continue
          const tmp = ctx.path
          ctx.path = ctx.path.slice(prefix.length)
          const wares = this.#find(ctx, children, depth + '   ')
          ctx.path = tmp
          if (!wares) continue
          return [...use, ...wares]
        }
        case 'route': {
          const { method, pathSegments, fn } = item
          if (
            method !== ctx.method
            || !this.#match(ctx, pathSegments)
          ) continue
          return [fn]
        }
      }
    }
    return null
  }

  #match(ctx, templateSegments) {
    const pathSegements = ctx.path.split('/')
    const params = ctx.params || {}
    for (let i = 0, l = templateSegments.length; i < l; i++) {
      const pathSegment = pathSegements[i]
      const templateSegment = templateSegments[i]
      if (templateSegment.startsWith(this.#paramPrefix)) {
        const key = templateSegment.slice(this.#paramPrefix.length)
        params[key] = pathSegment
      } else if (templateSegment !== pathSegment) {
        return false
      }
    }
    ctx.params = params
    return true
  }

  #getSpec() {
    return JSON.stringify(this.#getRoutesSpec(this.#routes), null, 2)
  }

  #getRoutesSpec(routes) {
    if (!routes) return
    return routes.map(item => {
      const { spec, prefix, children, route } = item
      return {
        spec,
        prefix,
        route,
        children: this.#getRoutesSpec(children)
      }
    })
  }
}
