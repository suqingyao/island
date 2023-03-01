import fg from 'fast-glob';
import path from 'path';
import { normalizePath } from 'vite';

interface RouteMeta {
  routePath: string;
  absolutePath: string;
}

export class RouteService {
  #scanDir: string;
  #routeData: RouteMeta[];
  constructor(scanDir: string) {
    this.#scanDir = scanDir;
  }

  async init() {
    const files = await fg
      .sync('**/*.{js,jsx,ts,tsx,md,mdx}', {
        cwd: this.#scanDir,
        absolute: true,
        ignore: ['**/build/**', '**/island/**', 'config.ts']
      })
      .sort();
    files.forEach((file) => {
      const fileRelativePath = normalizePath(
        path.relative(this.#scanDir, file)
      );
      const routePath = this.normalizeRoutePath(fileRelativePath);
      this.#routeData.push({
        routePath,
        absolutePath: file
      });
    });
  }

  generateRoutesCode() {
    return `
import React from 'react';
import loadable from '@loadable/component';
${this.#routeData
  .map((route, index) => {
    return `const Route${index} = loadable(() => import('${route.absolutePath}'));`;
  })
  .join('\n')}
export const routes = [
  ${this.#routeData.map((route, index) => {
    return `{ path: '${route.routePath}', element: React.createElement(Route${index}) }`;
  })}
]
    `;
  }

  getRouteMeta(): RouteMeta[] {
    return this.#routeData;
  }

  normalizeRoutePath(raw: string): string {
    const routePath = raw.replace(/\.(.*)?$/, '').replace(/index$/, '');
    return routePath.startsWith('/') ? routePath : `/${routePath}`;
  }
}
