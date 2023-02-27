import { resolve } from 'path';
import fs from 'fs-extra';
import { loadConfigFromFile } from 'vite';
import { SiteConfig, UserConfig } from '../shared/types';

type RawConfig =
  | UserConfig
  | Promise<UserConfig>
  | (() => UserConfig | Promise<UserConfig>);

function getUserConfigPath(root: string) {
  try {
    const supportConfigFiles = ['config.ts', 'config.js'];
    const configPath = supportConfigFiles
      .map((file) => resolve(root, file))
      .find(fs.pathExistsSync);
    return configPath;
  } catch (error) {
    console.log('Failed to load user config.');
    throw error;
  }
}

export async function resolveUserConfig(
  root: string,
  command: 'serve' | 'build',
  mode: 'development' | 'production'
) {
  const configPath = getUserConfigPath(root);
  const result = await loadConfigFromFile(
    {
      command,
      mode
    },
    configPath
  );

  if (result) {
    const { config: rawConfig = {} as RawConfig } = result;
    const userConfig = await (typeof rawConfig === 'function'
      ? rawConfig()
      : rawConfig);
    return [configPath, userConfig] as const;
  }
  return [configPath, {} as UserConfig] as const;
}

function resolveSiteData(userConfig: UserConfig): UserConfig {
  return {
    title: userConfig.title || 'island.js',
    description: userConfig.description || 'SSG Framework',
    themeConfig: userConfig.themeConfig || {},
    vite: userConfig.vite || {}
  };
}

export async function resolveConfig(
  root: string,
  command: 'serve' | 'build',
  mode: 'production' | 'development'
) {
  const [configPath, userConfig] = await resolveUserConfig(root, command, mode);

  const siteConfig: SiteConfig = {
    root,
    configPath,
    siteData: resolveSiteData(userConfig as UserConfig)
  };

  return siteConfig;
}

export function defineConfig(config: UserConfig): UserConfig {
  return config;
}
