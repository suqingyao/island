import pluginMdx from '@mdx-js/rollup';
import remarkGFM from 'remark-gfm';
import rehypeAutolinkHeading from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import { rehypePluginPreWrapper } from './rehypePlugins/preWrapper';
import { rehypePluginShiki } from './rehypePlugins/shiki';
import type { Plugin } from 'vite';
import shiki from 'shiki';
import { remarkPluginToc } from './remarkPlugins/toc';

export async function pluginMdxRollup(): Promise<Plugin> {
  return pluginMdx({
    remarkPlugins: [
      remarkGFM,
      remarkFrontmatter,
      [
        remarkMdxFrontmatter,
        {
          name: 'frontmatter'
        }
      ],
      remarkPluginToc
    ],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeading,
        {
          properties: {
            class: 'head-anchor'
          },
          content: {
            type: 'text',
            value: '#'
          }
        }
      ],
      rehypePluginPreWrapper,
      [
        rehypePluginShiki,
        {
          highlighter: await shiki.getHighlighter({
            theme: 'vitesse-dark'
          })
        }
      ]
    ]
  });
}
