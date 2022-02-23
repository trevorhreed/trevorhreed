import * as http from 'http'
import * as https from 'https'
import { Context } from './context.js'
import { Ware } from './ware.js'


export class Server extends Ware {
  #server = null
  #secure = false
  get secure() { return this.#secure }

  constructor() {
    super()
    this.use(async (ctx, next) => {
      try {
        await next()
        ctx.res.writeHead(
          ctx.status || ctx.body ? 200 : 204,
          ctx.statusText || '',
          ctx.getResponseHeaders()
        )
        ctx.res.end(ctx.body || '')
      } catch (err) {
        console.error(err)
        ctx.res.writeHead(500)
        ctx.res.end(err.message)
      }
    })
  }

  #listen(nodeReq, nodeRes) {
    super.run(
      new Context(
        nodeReq,
        nodeRes,
        { secure: this.secure }
      )
    )
  }

  serve(config, callback) {
    const { port, secure } = this.#coerceConfig(config)
    this.#secure = secure
    if (secure) {
      this.#server = https.createServer(this.#listen.bind(this))
    } else {
      this.#server = http.createServer(this.#listen.bind(this))
    }
    this.#server.listen(port)
    if (typeof callback === 'function') callback()
  }

  stop(callback) {
    this.#server.close(callback)
  }

  #coerceConfig(config) {
    const {
      port = 8080,
      secure = false
    } = typeof config === 'number' ? { port: config } : config || {}
    return { port, secure }
  }
}
