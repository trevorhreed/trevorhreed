import { Server, Context } from 'ace'

const app = new Server(Context)

const router = new Router({
  prefix: '/api',
  enableSpec: true
})

router.get('/ping', (ctx, next) => {
  ctx.state.result = 'foo'
  next()
})

router.routes([
  {
    spec: {
      desc: 'Version 1 of the API'
    },
    prefix: '/v1',
    use(ctx, next) {
      console.log('here/')
      next()
    },
    children: [
      {
        spec: {
          desc: 'Provides a simple response to show the server is running',
          request: 'schema',
          response: 'schema'
        },
        route: 'GET /ping',
        fn: ctx => {
          console.log('this???')
          return 'v1'
        }
      }
    ]
  }
])

app.use(router)

app.use(async ctx => {
  return `<!doctype html>
    <html>
      <head>
        <title>Tns Server</title>
        <style>
          td{
            padding: 1em 2em;
          }
        </style>
      </head>
      <body>
        <h1>Tns Server</h1>
        <table border=1>
          <tr>
            <td>Method:</td>
            <td>${ctx.method}</td>
          </tr>
          <tr>
            <td>Path:</td>
            <td>${ctx.path}</td>
          </tr>
          <tr>
            <td>Query:</td>
            <td><pre>${JSON.stringify(ctx.query, null, 2)}</pre></td>
          </tr>
        </table>
      </body>
    </html>
  `
})

app.serve(8080)
