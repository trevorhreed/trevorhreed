const getError = ({
  message = 'Unknown Error!'
} = {}) => {
  return new Error(message)
}


export const INVALID_METHOD = (found, allowed, route) => {
  return getError(`Invalid method: '${found}' found in route: '${route}'. Must be one of ${allowed.join()}.`)
}

export const INVALID_ROUTE = (route) => {
  return getError(`Invalid route: ${route}. Must follow form: 'HTTP_METHOD /RESOURCE_URL'.`)
}

export const INVALID_ROUTING_OBJECT = (routeObj) => {
  return getError(`Invalid route object: ${JSON.stringify(routeObj, null, 2)}.`)
}

export const INVALID_MIDDLEWARE = (ware) => {
  return getError(`Invalid middleware! Found '${typeof ware}', but expected either 'function' or 'object' with function property 'run'.`)
}
