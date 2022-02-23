import { INVALID_MIDDLEWARE } from './error.js'
import { noop } from './utils.js'


export class Ware {
  #wares
  #i
  #ctx
  #final
  #boundNext = this.#next.bind(this)

  constructor(wares = []) {
    this.#wares = wares
  }

  async #next() {
    if (this.#i > this.#wares.length) {
      throw new Error(`'next' called too many times. This should not happen.`)
    }
    const ware = this.#wares[this.#i++] || this.#final
    if (!ware) return
    const fn = typeof ware === 'function'
      ? ware
      : ware.run.bind(ware)
    const result = await fn(this.#ctx, this.#boundNext)
    if (result !== undefined) {
      this.#ctx.status = this.#ctx.status || 200
      this.#ctx.body = typeof result === 'string'
        ? result
        : JSON.stringify(result)
    }
  }

  async run(ctx, next = noop) {
    this.#i = 0
    this.#ctx = ctx
    this.#final = next
    await this.#boundNext()
  }

  use(ware) {
    if (
      !ware
      && typeof ware !== 'function'
      && typeof ware.run !== 'function'
    ) {
      throw INVALID_MIDDLEWARE(ware)
    }
    this.#wares.push(ware)
  }
}
