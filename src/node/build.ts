import {
  EXTERNALS,
  MASK_SPLITTER,
  PACKAGE_ROOT,
  SERVER_ENTRY_PATH
} from './constants/index';
import { build as viteBuild, InlineConfig } from 'vite';
import { CLIENT_ENTRY_PATH } from './constants';
import path, { dirname, join } from 'path';
import fs from 'fs-extra';
import type { RollupOutput } from 'rollup';
import ora from 'ora';
import { SiteConfig } from 'shared/types';
import { createVitePlugins } from './vitePlugins';
import { Route } from './plugin-routes';
import { RenderResult } from 'runtime/server-entry';
import { HelmetData } from 'react-helmet-async';

const CLIENT_OUTPUT = 'build';

export async function bundle(root: string, config: SiteConfig) {
  const resolveViteConfig = async (
    isServer: boolean
  ): Promise<InlineConfig> => {
    return {
      mode: 'production',
      root,
      plugins: await createVitePlugins(config, undefined, isServer),
      ssr: {
        noExternal: ['react-router-dom', 'lodash-es']
      },
      build: {
        minify: false,
        ssr: isServer,
        outDir: isServer
          ? path.join(root, '.temp')
          : path.join(root, CLIENT_OUTPUT),
        rollupOptions: {
          input: isServer ? SERVER_ENTRY_PATH : CLIENT_ENTRY_PATH,
          output: {
            format: isServer ? 'cjs' : 'esm'
          },
          external: EXTERNALS
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
    const publicDir = join(root, 'public');
    if (fs.pathExistsSync(publicDir)) {
      await fs.copy(publicDir, join(root, CLIENT_OUTPUT));
    }
    await fs.copy(join(PACKAGE_ROOT, 'vendors'), join(root, CLIENT_OUTPUT));
    return [clientBundle, serverBundle] as [RollupOutput, RollupOutput];
  } catch (err) {
    console.log(err);
  }
}

async function buildIslands(
  root: string,
  islandPathToMap: Record<string, string>
) {
  const islandInjectCode = `
    ${Object.entries(islandPathToMap)
      .map(
        ([islandName, islandPath]) =>
          `import { ${islandName} from '${islandPath}'}`
      )
      .join('')}
    window.ISLANDS = ${Object.keys(islandPathToMap).join(',')};
    window.ISLAND_PROPS = JSON.parse(
      document.getElementById('island-props').textContent
    );
  `;

  const injectId = 'island:inject';

  return viteBuild({
    mode: 'production',
    esbuild: {
      jsx: 'automatic'
    },
    build: {
      outDir: path.join(root, '.temp'),
      rollupOptions: {
        input: injectId,
        external: EXTERNALS
      }
    },
    plugins: [
      {
        name: 'island-inject',
        enforce: 'post',
        resolveId(id) {
          if (id.includes(MASK_SPLITTER)) {
            const [originId, importer] = id.split(MASK_SPLITTER);
            return this.resolve(originId, importer, { skipSelf: true });
          }
          if (id === injectId) {
            return id;
          }
        },
        load(id) {
          if (id === injectId) {
            return islandInjectCode;
          }
        },
        generateBundle(_, bundle) {
          for (const name in bundle) {
            if (bundle[name].type === 'asset') {
              delete bundle[name];
            }
          }
        }
      }
    ]
  });
}

export async function renderPage(
  render: (url: string, helmetContext: object) => RenderResult,
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
      const helmetContext = {
        context: {}
      } as HelmetData;
      const {
        appHtml,
        islandToPathMap,
        islandProps = []
      } = await render(routePath, helmetContext.context);

      const islandBundle = await buildIslands(root, islandToPathMap);

      const styleAssets = clientBundle.output.filter(
        (chunk) => chunk.type === 'asset' && chunk.fileName.endsWith('css')
      );

      const islandCode = (islandBundle as RollupOutput).output[0].code;

      const { helmet } = helmetContext.context;

      const normalizeVendorFilename = (fileName: string) =>
        fileName.replace(/\\/g, '_') + '.js';

      const html = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      ${helmet?.title?.toString() || ''}
      ${helmet?.meta?.toString() || ''}
      ${helmet?.link?.toString() || ''}
      ${helmet?.style?.toString() || ''}
      ${styleAssets
        .map((item) => `<link rel="stylesheet" href="/${item.fileName}">`)
        .join('\n')}
      <script type="importmap">
        {
          "imports": {
            ${EXTERNALS.map(
              (name) => `"${name}": "/${normalizeVendorFilename(name)}"`
            ).join(',')}
          }
        }
      </script>
    </head>
    <body>
      <div id="root">${appHtml}</div>
      <script type="module">${islandCode}</script>
      <script type="module" src="/${clientChunk.fileName}"></script>
      <script id="island-props">${JSON.stringify(islandProps)}</script>
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
