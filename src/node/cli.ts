import cac from 'cac'
import { createDevServer } from './dev'

const cli = cac('island').version('0.0.1').help()

cli.command('dev [root]', 'start dev server').action(async (root: string) => {
  console.log('dev', root)
  const server = await createDevServer(root)
  await (await server).listen()
  server.printUrls()
})

cli.parse()
