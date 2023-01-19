import { Plugin } from 'vite'
import { readFile } from 'fs/promises'
import { DEFAULT_TEMPLATE_PATH } from '../constants'

export function pluginIndexHtml(): Plugin {
  return {
    name: 'island:index-html',
    configureServer(server) {
      return () => {
        server.middlewares.use(async (req, res, next) => {
          const content = await readFile(DEFAULT_TEMPLATE_PATH, 'utf-8')
          res.setHeader('Content-Type', 'text/html')
          res.end(content)
        })
      }
    }
  }
}
