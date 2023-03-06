import { SERVER_ENTRY_PATH } from './constants/index';
import { build as viteBuild, InlineConfig } from 'vite';
import { CLIENT_ENTRY_PATH } from './constants';
import path, { dirname } from 'path';
import fs from 'fs-extra';
import type { RollupOutput } from 'rollup';
import ora from 'ora';
import { SiteConfig } from 'shared/types';
import { createVitePlugins } from './vitePlugins';
import { Route } from './plugin-routes';

export async function bundle(root: string, config: SiteConfig) {
  const resolveViteConfig = async (
    isServer: boolean
  ): Promise<InlineConfig> => {
    return {
      mode: 'production',
      root,
      plugins: await createVitePlugins(config, undefined, isServer),
      ssr: {
        noExternal: ['react-router-dom']
      },
      build: {
        minify: false,
        ssr: isServer,
        outDir: isServer ? path.join(root, '.temp') : path.join(root, 'build'),
        rollupOptions: {
          input: isServer ? SERVER_ENTRY_PATH : CLIENT_ENTRY_PATH,
          output: {
            format: isServer ? 'cjs' : 'esm'
          }
        }
      }
    };
  };

  const spinner = ora();
  spinner.start('Building client + server bundles...');

  try {
    const [clientBundle, serverBundle] = await Promise.all([
      viteBuild(await resolveViteConfig(false)),
      viteBuild(await resolveViteConfig(true))
    ]);
    return [clientBundle, serverBundle] as [RollupOutput, RollupOutput];
  } catch (err) {
    console.log(err);
  }
}

export async function renderPage(
  render: (pagePath: string) => string,
  root: string,
  clientBundle: RollupOutput,
  routes: Route[]
) {
  const clientChunk = clientBundle.output.find(
    (chunk) => chunk.type === 'chunk' && chunk.isEntry
  );

  await Promise.all(
    routes.map(async (route) => {
      const routePath = route.path;
      const appHtml = render(routePath);
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
  `.trim();

      const fileName = routePath.endsWith('/')
        ? `${routePath}/index.html`
        : `${routePath}.html`;
      await fs.ensureDir(path.join(root, 'build', dirname(fileName)));
      await fs.writeFile(path.join(root, 'build', fileName), html);
      await fs.remove(path.join(root, '.temp'));
    })
  );
}

export async function build(root: string = process.cwd(), config: SiteConfig) {
  const [clientBundle] = await bundle(root, config);
  const serverEntryPath = path.join(root, '.temp', 'server-entry.js');
  const { render, routes } = await import(serverEntryPath);
  try {
    await renderPage(render, root, clientBundle, routes);
  } catch (error) {
    console.log('Render page error \n', error);
  }
}
