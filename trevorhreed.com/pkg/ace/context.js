import { Query } from './query.js'
import { extToMime, fallbackMime } from './mime.js'

export class Context {
  req
  res
  state = {}
  #config

  constructor(req, res, config) {
    this.req = req
    this.res = res
    const {
      secure = false,
      trustProxy = false
    } = config || {}
    this.#config = { secure, trustProxy }
  }

  // Response Methods

  #headers
  set(key, value) {
    if (!this.#headers) this.#headers = {}
    this.#headers[key] = value
  }
  setIfEmpty(key, value) {
    if (!this.#headers) return
    if (typeof this.#headers[key] === 'string') return
    this.set(key, value)
  }

  remove(key) {
    if (!this.#headers) return
    delete this.#headers[key]
  }

  getResponseHeaders() {
    return this.#headers || {}
  }

  set type(type) {
    this.set('Content-Type', this.getMime(type))
  }

  getMime(type) {
    if (type.indexOf('/') === -1) {
      type = extToMime[type] || fallbackMime
    }
    return type
  }

  // Request Methods

  #protocol
  get protocol() {
    if (!this.#protocol) {
      this.#protocol = this.#config.secure ? 'https' : 'http'
    }
    return this.#protocol
  }

  #host
  get host() {
    if (!this.#host) {
      this.#host = this.req.headers.host
    }
    return this.#host
  }

  #method
  get method() {
    if (!this.#method) {
      this.#method = this.req.method
    }
    return this.#method
  }

  #url
  get url() {
    if (!this.#url) {
      this.#url = new URL(this.req.url, `${this.protocol}://${this.host}`)
    }
    return this.#url
  }

  #path
  get path() {
    if (!this.#path) {
      this.#path = this.url.pathname
    }
    return this.#path
  }
  set path(path) {
    this.#path = path
  }

  #query
  get query() {
    if (!this.#query) {
      this.#query = new Query(this.url.search.slice(1))
    }
    return this.#query
  }

  // route(pathTemplate, paramPrefix = ':') {
  //   const params = {}
  //   const pathSegements = ('' + this.path).split('/')
  //   const template = '' + pathTemplate
  //   template
  //     .split('/')
  //     .forEach((templateSegment, i) => {
  //       if (templateSegment.startsWith(paramPrefix)) {
  //         const key = templateSegment.slice(paramPrefix.length)
  //         const value = pathSegements[i]
  //         params[key] = value
  //       }
  //     })
  //   return params
  // }
}
