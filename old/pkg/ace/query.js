export class Query {
  #query = {}
  constructor(querystring) {
    querystring
      .split('&')
      .filter(Boolean)
      .forEach(part => {
        const [key, value = true] = part.split('=')
        if (this.#query[key] === undefined) {
          this.#query[key] = value
        } else if (Array.isArray(this.#query[key])) {
          this.#query[key].push(value)
        } else {
          const tmp = this.#query[key]
          this.#query[key] = [tmp, value]
        }
      })
  }

  has(key) {
    return this.#query[key] !== undefined
  }
  get(key, type) {
    const value = this.#query[key]
    if (type) value = this.#coerce(value)
    return value
  }

  toJSON() {
    return this.#query
  }

  #coerceScalar(value, type) {
    switch (type) {
      case 'string':
        return '' + value
      case 'number':
        return +value
      case 'boolean':
        return !!value
    }
  }

  #coerce(value, type) {
    if (Array.isArray(value)) {
      return value.map(x => this.#coerceScalar(x, type))
    } else {
      return this.#coerceScalar(value)
    }
  }
}
