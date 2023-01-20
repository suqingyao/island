import { SERVER_ENTRY_PATH } from './constants/index'
import { build as viteBuild, InlineConfig } from 'vite'
import { CLIENT_ENTRY_PATH } from './constants'
import * as path from 'path'
import * as fs from 'fs-extra'
import type { RollupOutput } from 'rollup'

export async function bundle(root: string) {
  const resolveViteConfig = (isServer: boolean): InlineConfig => {
    return {
      mode: 'production',
      root,
      build: {
        ssr: isServer,
        outDir: isServer ? '.temp' : 'build',
        rollupOptions: {
          input: isServer ? SERVER_ENTRY_PATH : CLIENT_ENTRY_PATH,
          output: {
            format: isServer ? 'cjs' : 'esm'
          }
        }
      }
    }
  }
  try {
    const [clientBundle, serverBundle] = await Promise.all([
      viteBuild(resolveViteConfig(false)),
      viteBuild(resolveViteConfig(true))
    ])
    return [clientBundle, serverBundle] as [RollupOutput, RollupOutput]
  } catch (err) {
    console.log(err)
  }
}

export async function renderPage(
  render: () => string,
  root: string,
  clientBundle: RollupOutput
) {
  const appHtml = render()
  const clientChunk = clientBundle.output.find(
    (chunk) => chunk.type === 'chunk' && chunk.isEntry
  )
  const html = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Document</title>
    </head>
    <body>
      <div id="root">${appHtml}</div>
      <script type="module" src="/${clientChunk.fileName}"></script>
    </body>
  </html>
  `.trim()
  await fs.ensureDir(path.join(root, 'build'))
  await fs.writeFile(path.join(root, 'build', 'index.html'), html)
  await fs.remove(path.join(root, '.temp'))
}

export async function build(root: string) {
  const [clientBundle, serverBundle] = await bundle(root)
  const serverEntryPath = path.join(root, '.temp', 'server-entry.js')
  const { render } = require(serverEntryPath)
  await renderPage(render, root, clientBundle)
}
