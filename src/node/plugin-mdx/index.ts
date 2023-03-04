import { Plugin } from 'vite';
import { pluginMdxHMR } from './pluginMdxHMR';
import { pluginMdxRollup } from './pluginMdxRollup';

export async function pluginMdx(): Promise<Plugin[]> {
  return [await pluginMdxRollup(), pluginMdxHMR()];
}
